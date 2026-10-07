/**
 * The VRS Pay API origin. Read on the server and passed to client
 * components as a prop. VRS_PAY_API_URL overrides it (e.g. in production).
 */
export const apiUrl = (
  process.env.VRS_PAY_API_URL ?? "http://localhost:4300"
).replace(/\/+$/, "");
