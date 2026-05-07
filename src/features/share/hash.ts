import { SpeciesSchema, type Species } from "../lenia/species";

const HASH_PREFIX = "#species=";

export function speciesToHash(species: Species): string {
  const payload = encodeBase64Url(JSON.stringify(species));
  return `${HASH_PREFIX}${payload}`;
}

export function speciesFromHash(hash: string): Species | undefined {
  if (!hash.startsWith(HASH_PREFIX)) {
    return undefined;
  }

  try {
    const json = decodeBase64Url(hash.slice(HASH_PREFIX.length));
    return SpeciesSchema.parse(JSON.parse(json));
  } catch {
    return undefined;
  }
}

export function setSpeciesHash(
  species: Species,
  locationLike: Pick<Location, "hash"> = window.location
): void {
  locationLike.hash = speciesToHash(species);
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value: string): string {
  const base64 = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
