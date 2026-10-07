-- Personal mailboxes are now visible only to their members. Until now only
-- the account owner could see any mailbox, so they become the member of
-- every existing personal mailbox and keep seeing it.
INSERT INTO "mailbox_members" ("id", "mailboxId", "userId", "role", "createdAt")
SELECT gen_random_uuid()::text, m."id", m."userId", 'owner', CURRENT_TIMESTAMP
FROM "mailboxes" m
WHERE m."kind" = 'personal'
  AND NOT EXISTS (
    SELECT 1 FROM "mailbox_members" mm
    WHERE mm."mailboxId" = m."id" AND mm."userId" = m."userId"
  );
