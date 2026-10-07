-- One email sent to two of an account's mailboxes is stored in each.
DROP INDEX "mail_messages_userId_messageId_key";

CREATE UNIQUE INDEX "mail_messages_mailboxId_messageId_key" ON "mail_messages"("mailboxId", "messageId");
