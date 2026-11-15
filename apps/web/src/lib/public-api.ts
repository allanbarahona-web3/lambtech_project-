function normalizeApiBaseUrl(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export const publicApiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);
