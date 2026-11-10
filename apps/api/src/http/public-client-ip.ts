import { isIP } from "node:net";

const IPV4_MAPPED_IPV6_PREFIX = "::ffff:";

export function getPublicClientIp(value: unknown): string {
  if (typeof value !== "string") {
    return "unknown";
  }

  const candidate = value.trim();
  if (isIP(candidate) === 4) {
    return candidate;
  }

  if (candidate.toLowerCase().startsWith(IPV4_MAPPED_IPV6_PREFIX)) {
    const ipv4 = candidate.slice(IPV4_MAPPED_IPV6_PREFIX.length);
    if (isIP(ipv4) === 4) {
      return ipv4;
    }
  }

  return isIP(candidate) === 6 ? candidate.toLowerCase() : "unknown";
}
