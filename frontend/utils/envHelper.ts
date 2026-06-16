import { env } from 'next-dynenv';

/**
 * Returns the configured Backend URL
 */
export function getBackendUrl(): string | undefined {
  return env('NEXT_PUBLIC_BACKEND_URL');
}

/**
 * Returns the configured Orchideo Connect Service URL
 */
export function getOrchideoConnectUrl(): string | undefined {
  return env('NEXT_PUBLIC_ORCHIDEO_CONNECT_SERVICE_URL');
}
