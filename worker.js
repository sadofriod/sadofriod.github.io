import slugRedirects from './lib/generated/slug-redirects.json';
import { handlePodcastRequest } from './lib/podcastRouter.js';
import { handlePhotoRequest } from './lib/photoRouter.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirect = slugRedirects[url.pathname];

    if (redirect) {
      return Response.redirect(new URL(redirect, url), 308);
    }

    const photoResponse = await handlePhotoRequest(request, env, ctx);
    if (photoResponse) return photoResponse;

    const podcastResponse = await handlePodcastRequest(request, env, ctx);
    if (podcastResponse) return podcastResponse;

    return env.ASSETS.fetch(request);
  },
};
