export function parseCorsOrigins(origins?: string): string[] | undefined {
  const parsedOrigins = origins
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return parsedOrigins && parsedOrigins.length > 0 ? parsedOrigins : undefined;
}
