import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIp(address: string) {
  if (address === "::1" || address === "::") return true;
  if (
    address.startsWith("fc") ||
    address.startsWith("fd") ||
    address.startsWith("fe80:")
  )
    return true;
  const octets = address.split(".").map(Number);
  if (octets.length !== 4) return false;
  const first = octets[0] ?? -1;
  const second = octets[1] ?? -1;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

export async function assertPublicWebhookUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Webhook URLs must use HTTPS without embedded credentials");
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    throw new Error("Webhook URLs must use a public host");
  }
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateIp(address))
  ) {
    throw new Error(
      "Webhook URLs cannot resolve to a private or reserved address",
    );
  }
}
