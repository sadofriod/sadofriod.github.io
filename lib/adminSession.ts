/**
 * Client-side view of "who is allowed to admin this site".
 *
 * With Cloudflare Access configured, the Worker validates the Access JWT that the edge
 * injects, so the browser never handles a secret: the pages just ask /api/whoami.
 * Without Access they fall back to the legacy UPLOAD_AUTH_KEY kept in sessionStorage.
 */

export type AdminSession = {
  /** Cloudflare Access is configured on the Worker. */
  access: boolean;
  /** The current request carried a valid Access identity. */
  authenticated: boolean;
  email: string | null;
  /** No Access configured: the legacy key form is the only way in. */
  keyRequired: boolean;
};

export const anonymousSession: AdminSession = {
  access: false,
  authenticated: false,
  email: null,
  keyRequired: true,
};

export async function fetchAdminSession(): Promise<AdminSession> {
  try {
    const response = await fetch('/api/whoami', { cache: 'no-store' });
    if (!response.ok) return anonymousSession;
    const payload = (await response.json()) as Partial<AdminSession>;
    return { ...anonymousSession, ...payload };
  } catch {
    return anonymousSession;
  }
}

/** Legacy key stored by the upload pages; empty string when never entered. */
export function storedUploadKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem('upload_auth') || '';
  } catch {
    return '';
  }
}

/** Body/FormData auth fields: nothing to send when Access already vouched for the request. */
export function legacyAuthFields(session: AdminSession, key: string): Record<string, string> {
  return session.access ? {} : { authKey: key };
}
