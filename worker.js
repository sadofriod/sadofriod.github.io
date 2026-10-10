import slugRedirects from './lib/generated/slug-redirects.json';
import { handlePodcastRequest } from './lib/podcastRouter.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const redirect = slugRedirects[url.pathname];

    if (redirect) {
      return Response.redirect(new URL(redirect, url), 308);
    }

    const podcastResponse = await handlePodcastRequest(request, env);
    if (podcastResponse) return podcastResponse;

    return env.ASSETS.fetch(request);
  },
};