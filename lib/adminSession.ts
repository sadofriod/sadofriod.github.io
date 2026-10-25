/**
 * Client-side view of "who is allowed to admin this site".
 *
 * With Cloudflare Access configured, the Worker validates the Access JWT that the edge
 * injects, so the browser never handles a secret: the pages ask the protected session
 * endpoint first, with /api/whoami retained as a fallback.
 * Without Access they fall back to the legacy UPLOAD_AUTH_KEY kept in sessionStorage.
 */

export type AdminSession = {
  /** Cloudflare Access is configured on the Worker. */
  access: boolean;
  /** The current request carried a valid Access identity. */
  authenticated: boolean;
  email: string | null;
  /** Which Access credential authenticated this request, when available. */
  source?: 'header' | 'cookie' | null;
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
  for (const endpoint of ['/api/admin/session', '/api/whoami']) {
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok || !/\bapplication\/(?:[a-z0-9.+-]*\+)?json\b/i.test(response.headers.get('content-type') || '')) continue;
      const payload = (await response.json()) as Partial<AdminSession>;
      return { ...anonymousSession, ...payload };
    } catch {
      // Access may redirect a stale session to its HTML login page; try the fallback.
    }
  }
  return anonymousSession;
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
