# Multivrs Mail Worker

This Cloudflare Worker is the durable delivery boundary for Multivrs Mail. The
web application signs jobs and sends them to `POST /queue`; the Worker stores
them in `multivrs-mail-delivery`, retries failures, and moves exhausted jobs to
`multivrs-mail-dead-letter`.

The cron trigger runs every minute. It asks the signed internal control-plane
endpoint for due scheduled messages and broadcasts, then enqueues each message.
The queue consumer calls the signed internal delivery endpoint. Provider calls
there use the configured outbound adapter and record `sent`; only provider
events can advance a message to `delivered`, `opened`, `bounced`, or
`complained`.

Create the queues before deployment:

```bash
bunx wrangler queues create multivrs-mail-delivery
bunx wrangler queues create multivrs-mail-dead-letter
bunx wrangler secret put MAIL_WORKER_SECRET
```

Set `CONTROL_PLANE_URL` in `wrangler.toml` to the production dashboard origin,
then run `bun run deploy:mail-worker` from the repository root.
