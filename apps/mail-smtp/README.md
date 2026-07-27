# Multivrs SMTP gateway

The submission gateway accepts Multivrs SMTP credentials over port 587, parses
the RFC 5322 message, and sends it through the same tenant-scoped queue and
provider pipeline as the REST API. Passwords are verified by the control plane;
the gateway does not store them.

Production requires `CONTROL_PLANE_URL`, `SMTP_TLS_CERT`, and `SMTP_TLS_KEY`.
Use `SMTP_ALLOW_INSECURE_LOCAL=true` only for local testing. The public hostname
shown to customers is configured with `MULTIVRS_SMTP_HOST` in the web app.
