import slugRedirects from './lib/generated/slug-redirects.json';
import { handlePodcastRequest } from './lib/podcastRouter.js';
import { handlePhotoRequest } from './lib/photoRouter.js';
import { accessConfigured, accessIdentity } from './lib/accessAuth.js';
import { handlePhotoSeoRequest } from './lib/photoSeo.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirect = slugRedirects[url.pathname];

    if (redirect) {
      return Response.redirect(new URL(redirect, url), 308);
    }

    // Both URLs return the same session payload. /api/admin/session is covered by
    // the Access application prefix so the edge injects its JWT assertion there.
    if ((url.pathname === '/api/whoami' || url.pathname === '/api/admin/session') && request.method === 'GET') {
      const access = accessConfigured(env);
      const identity = await accessIdentity(request, env);
      return Response.json(
        {
          access,
          email: identity ? identity.email : null,
          source: identity ? identity.source : null,
          authenticated: Boolean(identity),
          keyRequired: !access,
        },
        { headers: { 'cache-control': 'no-store' } }
      );
    }

    const photoSeoResponse = await handlePhotoSeoRequest(request, env);
    if (photoSeoResponse) return photoSeoResponse;

    const photoResponse = await handlePhotoRequest(request, env, ctx);
    if (photoResponse) return photoResponse;

    const podcastResponse = await handlePodcastRequest(request, env, ctx);
    if (podcastResponse) return podcastResponse;

    return env.ASSETS.fetch(request);
  },
};
