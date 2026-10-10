<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Check @RULES.md and use the necessary rules.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

When you are working on auth make sure you use @BETTER_AUTH.md and @PRISMA_ORM.md for relevant information. Platform email (sign-up codes, team invitations) is sent through AWS SES with `sendEmail` in `src/lib/email/client.ts`.

For backend, database and functionality use @DATABASE.md, CONVEX_NEXT.md

<!-- END:nextjs-agent-rules -->
