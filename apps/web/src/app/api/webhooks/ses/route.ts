import { prisma } from "@/lib/prisma";
import {
  type SesEventPayload,
  sesEventPayloadSchema,
  snsMessageSchema,
} from "@/lib/schemas/mail-provider.schemas";
import { logError, logInfo } from "@/lib/services/logger.service";
import { receiveMail } from "@/lib/services/mail-message.service";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";

export async function POST(request: Request) {
  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch (error) {
    return Response.json({ error: "Failed to read request body" }, { status: 400 });
  }

  let bodyJson: unknown;
  try {
    bodyJson = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Check if this is an AWS SNS payload
  const snsParsed = snsMessageSchema.safeParse(bodyJson);
  if (snsParsed.success) {
    const snsData = snsParsed.data;

    // Handle SNS Subscription Confirmation automatically
    if (snsData.Type === "SubscriptionConfirmation" && snsData.SubscribeURL) {
      logInfo("ses.webhook.confirming_subscription", snsData.TopicArn ? { topicArn: snsData.TopicArn } : undefined);
      try {
        const response = await fetch(snsData.SubscribeURL);
        if (response.ok) {
          logInfo("ses.webhook.subscription_confirmed", snsData.TopicArn ? { topicArn: snsData.TopicArn } : undefined);
          return Response.json({ status: "subscribed" }, { status: 200 });
        }
      } catch (error) {
        logError("ses.webhook.subscription_failed", error, snsData.TopicArn ? { topicArn: snsData.TopicArn } : undefined);
        return Response.json({ error: "Subscription confirmation failed" }, { status: 500 });
      }
    }

    if (snsData.Type === "Notification" && snsData.Message) {
      try {
        const parsedMessage = JSON.parse(snsData.Message);
        return handleSesEvent(parsedMessage, snsData.MessageId);
      } catch {
        return Response.json({ error: "Failed to parse SNS message JSON" }, { status: 400 });
      }
    }

    if (snsData.Type === "UnsubscribeConfirmation") {
      logInfo("ses.webhook.unsubscribed", snsData.TopicArn ? { topicArn: snsData.TopicArn } : undefined);
      return Response.json({ status: "unsubscribed" }, { status: 200 });
    }
  }

  // If not SNS wrapped, try processing directly as SES Event payload (e.g. from EventBridge / direct webhook)
  return handleSesEvent(bodyJson);
}

async function handleSesEvent(rawEvent: unknown, snsMessageId?: string) {
  const parsed = sesEventPayloadSchema.safeParse(rawEvent);
  if (!parsed.success) {
    return Response.json(
      { error: "Unsupported SES event payload", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const sesEvent: SesEventPayload = parsed.data;
  const messageId = sesEvent.mail.messageId;

  // Handle Inbound Received emails
  if (sesEvent.eventType === "Received") {
    const recipient =
      sesEvent.mail.destination?.[0] ||
      sesEvent.mail.commonHeaders?.to?.[0];
    const from =
      sesEvent.mail.source ||
      sesEvent.mail.commonHeaders?.from?.[0];

    if (!recipient || !from) {
      return Response.json(
        { error: "Missing recipient or sender in received email" },
        { status: 400 },
      );
    }

    try {
      const result = await receiveMail({
        providerEventId: snsMessageId || messageId,
        mailbox: recipient,
        messageId,
        from,
        to: sesEvent.mail.destination || [recipient],
        cc: [],
        references: [],
        headers: {},
        subject: sesEvent.mail.commonHeaders?.subject || "(no subject)",
        text: (rawEvent as Record<string, unknown>).content as string | undefined,
      });

      return Response.json({ received: true, ...result }, { status: 200 });
    } catch (error) {
      logError("ses.webhook.receive_mail_failed", error, {
        messageId,
        recipient,
        from,
      });
      return Response.json(
        { error: error instanceof Error ? error.message : "Failed to store received mail" },
        { status: 500 },
      );
    }
  }

  // Find the message in our database for Outbound events (Delivery, Bounce, Complaint, Open, Click)
  const message = await prisma.mailMessage.findFirst({
    where: { providerMessageId: messageId },
    select: { id: true, userId: true },
  });

  if (!message) {
    logInfo("ses.webhook.message_not_found", {
      providerMessageId: messageId,
      eventType: sesEvent.eventType,
    });
    return Response.json({ accepted: true, matched: false }, { status: 200 });
  }


  const occurredAt = sesEvent.mail.timestamp
    ? new Date(sesEvent.mail.timestamp)
    : new Date();
  const providerEventId =
    snsMessageId ||
    `${messageId}:${sesEvent.eventType}:${occurredAt.getTime()}`;

  const eventType = sesEvent.eventType;

  // Map to internal event type and message status
  let internalEventType = `email.${eventType.toLowerCase()}`;
  let messageStatus: string | undefined;

  if (eventType === "Delivery") {
    internalEventType = "email.delivered";
    messageStatus = "delivered";
  } else if (eventType === "Bounce") {
    internalEventType = "email.bounced";
    messageStatus = "bounced";
  } else if (eventType === "Complaint") {
    internalEventType = "email.complained";
    messageStatus = "complained";
  } else if (eventType === "Open") {
    internalEventType = "email.opened";
  } else if (eventType === "Click") {
    internalEventType = "email.clicked";
  }

  const savedEvent = await prisma.$transaction(async (tx) => {
    // 1. Record MailEvent
    const mailEvent = await tx.mailEvent.upsert({
      where: {
        userId_providerEventId: {
          userId: message.userId,
          providerEventId,
        },
      },
      create: {
        userId: message.userId,
        messageId: message.id,
        providerEventId,
        type: internalEventType,
        payload: JSON.parse(JSON.stringify(rawEvent)),
        occurredAt,
      },
      update: {},
    });


    // 2. Update MailMessage status if applicable
    if (messageStatus) {
      await tx.mailMessage.update({
        where: { id: message.id },
        data: { status: messageStatus },
      });
    }

    // 3. Handle suppressions on Bounces
    if (eventType === "Bounce" && sesEvent.bounce?.bouncedRecipients) {
      for (const recipient of sesEvent.bounce.bouncedRecipients) {
        if (recipient.emailAddress) {
          await tx.mailSuppression.upsert({
            where: {
              userId_email_type: {
                userId: message.userId,
                email: recipient.emailAddress.toLowerCase(),
                type: "bounce",
              },
            },
            create: {
              userId: message.userId,
              email: recipient.emailAddress.toLowerCase(),
              type: "bounce",
              reason:
                sesEvent.bounce.bounceType ||
                recipient.diagnosticCode ||
                "Hard bounce reported by SES",
            },
            update: {},
          });
        }
      }
    }

    // 4. Handle suppressions on Complaints
    if (eventType === "Complaint" && sesEvent.complaint?.complainedRecipients) {
      for (const recipient of sesEvent.complaint.complainedRecipients) {
        if (recipient.emailAddress) {
          await tx.mailSuppression.upsert({
            where: {
              userId_email_type: {
                userId: message.userId,
                email: recipient.emailAddress.toLowerCase(),
                type: "complaint",
              },
            },
            create: {
              userId: message.userId,
              email: recipient.emailAddress.toLowerCase(),
              type: "complaint",
              reason:
                sesEvent.complaint.complaintFeedbackType ||
                "Spam complaint reported by SES",
            },
            update: {},
          });
        }
      }
    }

    return mailEvent;
  });

  await enqueueMailWebhooks(savedEvent.id);

  return Response.json({ accepted: true, matched: true, eventId: savedEvent.id }, { status: 200 });
}
