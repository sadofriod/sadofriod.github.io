import slugRedirects from './lib/generated/slug-redirects.json';
import { handlePodcastRequest } from './lib/podcastRouter.js';
import { handlePhotoRequest } from './lib/photoRouter.js';
import { accessConfigured, accessIdentity } from './lib/accessAuth.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirect = slugRedirects[url.pathname];

    if (redirect) {
      return Response.redirect(new URL(redirect, url), 308);
    }

    // Who am I: the admin pages use this to decide whether to show the upload form,
    // the Access identity, or the legacy key prompt.
    if (url.pathname === '/api/whoami' && request.method === 'GET') {
      const access = accessConfigured(env);
      const identity = await accessIdentity(request, env);
      return Response.json(
        {
          access,
          email: identity ? identity.email : null,
          authenticated: Boolean(identity),
          keyRequired: !access,
        },
        { headers: { 'cache-control': 'no-store' } }
      );
    }

    const photoResponse = await handlePhotoRequest(request, env, ctx);
    if (photoResponse) return photoResponse;

    const podcastResponse = await handlePodcastRequest(request, env, ctx);
    if (podcastResponse) return podcastResponse;

    return env.ASSETS.fetch(request);
  },
};
