interface SmtpConfig {
  allowInsecureLocal: boolean;
  controlPlaneUrl: string;
  port: number;
  tlsCert?: string;
  tlsKey?: string;
}

function pem(value: string | undefined) {
  return value?.replaceAll("\\n", "\n");
}

export function smtpConfig(): SmtpConfig {
  const allowInsecureLocal = process.env.SMTP_ALLOW_INSECURE_LOCAL === "true";
  const tlsCert = pem(process.env.SMTP_TLS_CERT);
  const tlsKey = pem(process.env.SMTP_TLS_KEY);
  if ((!tlsCert || !tlsKey) && !allowInsecureLocal) {
    throw new Error("SMTP_TLS_CERT and SMTP_TLS_KEY are required");
  }
  return {
    allowInsecureLocal,
    controlPlaneUrl: (process.env.CONTROL_PLANE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
    port: Number(process.env.SMTP_PORT ?? 587),
    tlsCert,
    tlsKey,
  };
}
