import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";
import { smtpConfig } from "./config";
import { authorize, submitMail } from "./control-plane";

const config = smtpConfig();
const credentials = new WeakMap<object, string>();

const server = new SMTPServer({
  key: config.tlsKey,
  cert: config.tlsCert,
  disabledCommands: config.allowInsecureLocal ? ["STARTTLS"] : [],
  authOptional: false,
  allowInsecureAuth: config.allowInsecureLocal,
  size: 25 * 1024 * 1024,
  async onAuth(auth, session, callback) {
    try {
      if (auth.method !== "PLAIN" && auth.method !== "LOGIN") {
        callback(new Error("Unsupported authentication method"));
        return;
      }
      if (!auth.username || !auth.password) {
        callback(new Error("A username and password are required"));
        return;
      }
      if (!(await authorize(config.controlPlaneUrl, auth.username, auth.password))) {
        callback(new Error("Invalid SMTP credentials"));
        return;
      }
      credentials.set(session, auth.password);
      callback(null, { user: auth.username });
    } catch {
      callback(new Error("SMTP authentication is temporarily unavailable"));
    }
  },
  async onData(stream, session, callback) {
    try {
      const password = credentials.get(session);
      if (!password) throw new Error("SMTP session is not authenticated");
      const mail = await simpleParser(stream, { skipHtmlToText: true });
      await submitMail(config.controlPlaneUrl, password, mail);
      callback();
    } catch (error) {
      callback(error instanceof Error ? error : new Error("Mail submission failed"));
    }
  },
});

server.on("error", (error) => {
  process.stderr.write(`SMTP gateway error: ${String(error)}\n`);
});
server.listen(config.port, () => {
  process.stdout.write(`Multivrs SMTP listening on ${config.port}\n`);
});
