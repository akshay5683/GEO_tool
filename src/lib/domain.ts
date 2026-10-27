/**
 * Domain normalization shared by the UI and the server.
 *
 * This is a syntactic check only. It rejects inputs that can never be a public
 * website (IP literals, localhost, internal suffixes). Network-level SSRF
 * protection (DNS resolution, private-range checks, redirect validation) lives
 * in the server crawler and must still run before any request is made.
 */

export type DomainResult =
  | { ok: true; domain: string }
  | { ok: false; reason: string };

const BLOCKED_SUFFIXES = [
  "localhost",
  "local",
  "localdomain",
  "internal",
  "intranet",
  "lan",
  "home",
  "corp",
  "private",
  "test",
  "example",
  "invalid",
  "onion",
  "arpa",
  "home.arpa",
];

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const TLD = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

export function normalizeDomain(input: string): DomainResult {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "Enter a domain." };
  if (raw.length > 2048) return { ok: false, reason: "Input is too long." };

  let host: string;
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, reason: "Only http and https websites are supported." };
    }
    if (url.username || url.password) {
      return { ok: false, reason: "Credentials in URLs are not allowed." };
    }
    if (url.port && url.port !== "80" && url.port !== "443") {
      return { ok: false, reason: "Custom ports are not supported." };
    }
    host = url.hostname;
  } catch {
    return { ok: false, reason: "That does not look like a valid domain." };
  }

  host = host.toLowerCase().replace(/\.$/, "");
  if (host.startsWith("[") || /^\d+(\.\d+){3}$/.test(host) || /^\d+$/.test(host)) {
    return { ok: false, reason: "IP addresses are not allowed. Enter a public domain name." };
  }
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.length > 253) return { ok: false, reason: "Domain is too long." };

  const labels = host.split(".");
  if (labels.length < 2) return { ok: false, reason: "Enter a full domain such as example.com." };
  if (!labels.every((label) => LABEL.test(label))) {
    return { ok: false, reason: "Domain contains invalid characters." };
  }
  if (!TLD.test(labels[labels.length - 1])) {
    return { ok: false, reason: "Domain has an invalid top-level domain." };
  }
  for (const suffix of BLOCKED_SUFFIXES) {
    if (host === suffix || host.endsWith(`.${suffix}`)) {
      return { ok: false, reason: "Internal or reserved domains are not allowed." };
    }
  }

  return { ok: true, domain: host };
}
