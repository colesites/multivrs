export interface MailJob {
  userId: string;
  messageId: string;
}

export interface Env {
  MAIL_QUEUE: Queue<MailJob>;
  MAIL_WORKER_SECRET: string;
  CONTROL_PLANE_URL: string;
}
