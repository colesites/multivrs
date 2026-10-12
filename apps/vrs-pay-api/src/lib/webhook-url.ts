import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** Every address a hostname resolves to. Swappable so tests don't touch DNS. */
export type Resolver = (hostname: string) => Promise<string[]>;

export const dnsResolver: Resolver = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map((a) => a.address);

/** Names that only mean something inside a network (Fly's 6PN names included). */
const INTERNAL_NAMES = /(^|\.)(localhost|local|localdomain|internal|flycast|home\.arpa)$/i;

function privateIPv4(ip: string): boolean {
  const [a = 0, b = 0] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0)) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast and reserved
  );
}

function privateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  // IPv4-mapped, as typed (::ffff:10.0.0.1) or as URLs normalise it (::ffff:a00:1).
  const dotted = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted?.[1]) return privateIPv4(dotted[1]);
  const hex = v.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex?.[1] && hex[2]) {
    const high = Number.parseInt(hex[1], 16);
    const low = Number.parseInt(hex[2], 16);
    return privateIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }
  const first = Number.parseInt(v.split(":")[0] || "0", 16);
  return (
    (first & 0xfe00) === 0xfc00 || // unique local, Fly's fdaa::
    (first & 0xffc0) === 0xfe80 || // link-local
    (first & 0xff00) === 0xff00 // multicast
  );
}

/** Loopback, private, link-local, CGNAT, multicast or otherwise not on the public internet. */
export function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return privateIPv4(ip);
  if (version === 6) return privateIPv6(ip);
  return true;
}

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

/** True when the URL's host is localhost, an internal name or a private IP literal. */
export function isInternalHost(url: string): boolean {
  const host = hostOf(url);
  if (INTERNAL_NAMES.test(host)) return true;
  return isIP(host) !== 0 && isPrivateAddress(host);
}

/**
 * Throws unless every address the URL's host resolves to is public. Run
 * right before sending, so a public name re-pointed at an internal address
 * is refused too.
 */
export async function assertPublicDestination(
  url: string,
  resolve: Resolver = dnsResolver,
): Promise<void> {
  if (isInternalHost(url)) throw new Error("Webhook URL points at a private address.");
  const host = hostOf(url);
  if (isIP(host)) return;
  let addresses: string[];
  try {
    addresses = await resolve(host);
  } catch {
    throw new Error(`Couldn't resolve ${host}.`);
  }
  if (addresses.length === 0) throw new Error(`Couldn't resolve ${host}.`);
  if (addresses.some(isPrivateAddress)) {
    throw new Error("Webhook URL resolves to a private address.");
  }
}
