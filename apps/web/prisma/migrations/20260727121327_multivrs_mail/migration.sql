-- CreateTable
CREATE TABLE "mail_domains" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "domain" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'sending',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "region" TEXT NOT NULL DEFAULT 'auto',
    "provider" TEXT,
    "providerDomainId" TEXT,
    "verificationCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_dns_records" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_dns_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailboxes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "domainId" TEXT,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'personal',
    "status" TEXT NOT NULL DEFAULT 'active',
    "signature" TEXT,
    "catchAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailbox_members" (
    "id" TEXT NOT NULL,
    "mailboxId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mailbox_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_aliases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT,
    "mailboxId" TEXT,
    "address" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'alias',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mailboxId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "normalizedSubject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedToId" TEXT,
    "replyingUserId" TEXT,
    "replyingSince" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mailboxId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "messageId" TEXT NOT NULL,
    "inReplyTo" TEXT,
    "references" TEXT[],
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "folder" TEXT NOT NULL DEFAULT 'inbox',
    "fromName" TEXT,
    "fromAddress" TEXT NOT NULL,
    "toAddresses" TEXT[],
    "ccAddresses" TEXT[],
    "bccAddresses" TEXT[],
    "replyTo" TEXT,
    "subject" TEXT NOT NULL,
    "textBody" TEXT,
    "htmlBody" TEXT,
    "sanitizedHtml" TEXT,
    "headers" JSONB,
    "tags" JSONB,
    "rawMimeKey" TEXT,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "remoteImagesBlocked" BOOLEAN NOT NULL DEFAULT true,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "inline" BOOLEAN NOT NULL DEFAULT false,
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_labels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_message_labels" (
    "messageId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "mail_message_labels_pkey" PRIMARY KEY ("messageId","labelId")
);

-- CreateTable
CREATE TABLE "mail_internal_notes" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_thread_activities" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_thread_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "properties" JSONB,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "consentAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'manual',
    "lastEngagedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_audiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'static',
    "filter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_audience_members" (
    "audienceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "subscriptionState" TEXT NOT NULL DEFAULT 'subscribed',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_audience_members_pkey" PRIMARY KEY ("audienceId","contactId")
);

-- CreateTable
CREATE TABLE "mail_suppressions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "variables" TEXT[],
    "testData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_broadcasts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "audienceId" TEXT,
    "templateVersionId" TEXT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "stats" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_automations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'live',
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "secretHint" TEXT NOT NULL,
    "permissions" TEXT[],
    "ipRestrictions" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_webhook_endpoints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secretHash" TEXT NOT NULL,
    "secretHint" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "responseCode" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT,
    "broadcastId" TEXT,
    "type" TEXT NOT NULL,
    "providerEventId" TEXT,
    "payload" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_routing_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT,
    "mailboxId" TEXT,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_saved_replies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mailboxId" TEXT,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_saved_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_idempotency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_idempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mail_domains_userId_status_idx" ON "mail_domains"("userId", "status");

-- CreateIndex
CREATE INDEX "mail_domains_projectId_idx" ON "mail_domains"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_domains_userId_domain_key" ON "mail_domains"("userId", "domain");

-- CreateIndex
CREATE INDEX "mail_dns_records_domainId_status_idx" ON "mail_dns_records"("domainId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mail_dns_records_domainId_purpose_name_key" ON "mail_dns_records"("domainId", "purpose", "name");

-- CreateIndex
CREATE INDEX "mailboxes_projectId_idx" ON "mailboxes"("projectId");

-- CreateIndex
CREATE INDEX "mailboxes_domainId_idx" ON "mailboxes"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "mailboxes_userId_address_key" ON "mailboxes"("userId", "address");

-- CreateIndex
CREATE INDEX "mailbox_members_userId_idx" ON "mailbox_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mailbox_members_mailboxId_userId_key" ON "mailbox_members"("mailboxId", "userId");

-- CreateIndex
CREATE INDEX "mail_aliases_mailboxId_idx" ON "mail_aliases"("mailboxId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_aliases_userId_address_key" ON "mail_aliases"("userId", "address");

-- CreateIndex
CREATE INDEX "mail_threads_userId_mailboxId_lastMessageAt_idx" ON "mail_threads"("userId", "mailboxId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "mail_threads_assignedToId_status_idx" ON "mail_threads"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "mail_messages_userId_mailboxId_folder_createdAt_idx" ON "mail_messages"("userId", "mailboxId", "folder", "createdAt");

-- CreateIndex
CREATE INDEX "mail_messages_threadId_createdAt_idx" ON "mail_messages"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "mail_messages_providerMessageId_idx" ON "mail_messages"("providerMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_messages_userId_messageId_key" ON "mail_messages"("userId", "messageId");

-- CreateIndex
CREATE INDEX "mail_attachments_messageId_idx" ON "mail_attachments"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_labels_userId_name_key" ON "mail_labels"("userId", "name");

-- CreateIndex
CREATE INDEX "mail_message_labels_labelId_idx" ON "mail_message_labels"("labelId");

-- CreateIndex
CREATE INDEX "mail_internal_notes_threadId_createdAt_idx" ON "mail_internal_notes"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "mail_thread_activities_threadId_createdAt_idx" ON "mail_thread_activities"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "mail_contacts_userId_status_idx" ON "mail_contacts"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mail_contacts_userId_email_key" ON "mail_contacts"("userId", "email");

-- CreateIndex
CREATE INDEX "mail_audiences_userId_createdAt_idx" ON "mail_audiences"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "mail_audiences_userId_name_key" ON "mail_audiences"("userId", "name");

-- CreateIndex
CREATE INDEX "mail_audience_members_contactId_idx" ON "mail_audience_members"("contactId");

-- CreateIndex
CREATE INDEX "mail_suppressions_userId_createdAt_idx" ON "mail_suppressions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "mail_suppressions_userId_email_type_key" ON "mail_suppressions"("userId", "email", "type");

-- CreateIndex
CREATE INDEX "mail_templates_projectId_idx" ON "mail_templates"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_templates_userId_name_key" ON "mail_templates"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "mail_template_versions_templateId_version_key" ON "mail_template_versions"("templateId", "version");

-- CreateIndex
CREATE INDEX "mail_broadcasts_userId_status_createdAt_idx" ON "mail_broadcasts"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "mail_broadcasts_projectId_idx" ON "mail_broadcasts"("projectId");

-- CreateIndex
CREATE INDEX "mail_automations_userId_status_idx" ON "mail_automations"("userId", "status");

-- CreateIndex
CREATE INDEX "mail_automations_projectId_idx" ON "mail_automations"("projectId");

-- CreateIndex
CREATE INDEX "mail_credentials_userId_kind_createdAt_idx" ON "mail_credentials"("userId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "mail_credentials_projectId_idx" ON "mail_credentials"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_credentials_secretHash_key" ON "mail_credentials"("secretHash");

-- CreateIndex
CREATE INDEX "mail_webhook_endpoints_userId_createdAt_idx" ON "mail_webhook_endpoints"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "mail_webhook_endpoints_projectId_idx" ON "mail_webhook_endpoints"("projectId");

-- CreateIndex
CREATE INDEX "mail_webhook_deliveries_status_nextAttemptAt_idx" ON "mail_webhook_deliveries"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "mail_webhook_deliveries_endpointId_eventId_key" ON "mail_webhook_deliveries"("endpointId", "eventId");

-- CreateIndex
CREATE INDEX "mail_events_userId_type_occurredAt_idx" ON "mail_events"("userId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "mail_events_messageId_occurredAt_idx" ON "mail_events"("messageId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "mail_events_userId_providerEventId_key" ON "mail_events"("userId", "providerEventId");

-- CreateIndex
CREATE INDEX "mail_routing_rules_userId_priority_idx" ON "mail_routing_rules"("userId", "priority");

-- CreateIndex
CREATE INDEX "mail_saved_replies_mailboxId_idx" ON "mail_saved_replies"("mailboxId");

-- CreateIndex
CREATE UNIQUE INDEX "mail_saved_replies_userId_name_key" ON "mail_saved_replies"("userId", "name");

-- CreateIndex
CREATE INDEX "mail_idempotency_expiresAt_idx" ON "mail_idempotency"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "mail_idempotency_userId_scope_key_key" ON "mail_idempotency"("userId", "scope", "key");

-- AddForeignKey
ALTER TABLE "mail_domains" ADD CONSTRAINT "mail_domains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_domains" ADD CONSTRAINT "mail_domains_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_dns_records" ADD CONSTRAINT "mail_dns_records_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mail_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mail_domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailbox_members" ADD CONSTRAINT "mailbox_members_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailbox_members" ADD CONSTRAINT "mailbox_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_aliases" ADD CONSTRAINT "mail_aliases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_aliases" ADD CONSTRAINT "mail_aliases_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mail_domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_aliases" ADD CONSTRAINT "mail_aliases_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_threads" ADD CONSTRAINT "mail_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_threads" ADD CONSTRAINT "mail_threads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_threads" ADD CONSTRAINT "mail_threads_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_messages" ADD CONSTRAINT "mail_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_messages" ADD CONSTRAINT "mail_messages_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_messages" ADD CONSTRAINT "mail_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "mail_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_attachments" ADD CONSTRAINT "mail_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "mail_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_labels" ADD CONSTRAINT "mail_labels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_message_labels" ADD CONSTRAINT "mail_message_labels_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "mail_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_message_labels" ADD CONSTRAINT "mail_message_labels_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "mail_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_internal_notes" ADD CONSTRAINT "mail_internal_notes_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "mail_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_internal_notes" ADD CONSTRAINT "mail_internal_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_thread_activities" ADD CONSTRAINT "mail_thread_activities_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "mail_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_thread_activities" ADD CONSTRAINT "mail_thread_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_contacts" ADD CONSTRAINT "mail_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_audiences" ADD CONSTRAINT "mail_audiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_audience_members" ADD CONSTRAINT "mail_audience_members_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "mail_audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_audience_members" ADD CONSTRAINT "mail_audience_members_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "mail_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_suppressions" ADD CONSTRAINT "mail_suppressions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_templates" ADD CONSTRAINT "mail_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_templates" ADD CONSTRAINT "mail_templates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_template_versions" ADD CONSTRAINT "mail_template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "mail_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_broadcasts" ADD CONSTRAINT "mail_broadcasts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_broadcasts" ADD CONSTRAINT "mail_broadcasts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_broadcasts" ADD CONSTRAINT "mail_broadcasts_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "mail_audiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_broadcasts" ADD CONSTRAINT "mail_broadcasts_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "mail_template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_automations" ADD CONSTRAINT "mail_automations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_automations" ADD CONSTRAINT "mail_automations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_credentials" ADD CONSTRAINT "mail_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_credentials" ADD CONSTRAINT "mail_credentials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_webhook_endpoints" ADD CONSTRAINT "mail_webhook_endpoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_webhook_endpoints" ADD CONSTRAINT "mail_webhook_endpoints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_webhook_deliveries" ADD CONSTRAINT "mail_webhook_deliveries_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "mail_webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_events" ADD CONSTRAINT "mail_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_events" ADD CONSTRAINT "mail_events_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "mail_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_events" ADD CONSTRAINT "mail_events_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "mail_broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_routing_rules" ADD CONSTRAINT "mail_routing_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_routing_rules" ADD CONSTRAINT "mail_routing_rules_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mail_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_routing_rules" ADD CONSTRAINT "mail_routing_rules_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_saved_replies" ADD CONSTRAINT "mail_saved_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_saved_replies" ADD CONSTRAINT "mail_saved_replies_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_idempotency" ADD CONSTRAINT "mail_idempotency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
