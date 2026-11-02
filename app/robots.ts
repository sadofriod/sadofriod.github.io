import { baseUrl } from './sitemap'

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      { userAgent: '*' },
      { userAgent: 'GPTBot' },
      { userAgent: 'OAI-SearchBot' },
      { userAgent: 'ChatGPT-User' },
      { userAgent: 'ClaudeBot' },
      { userAgent: 'Claude-SearchBot' },
      { userAgent: 'PerplexityBot' },
      { userAgent: 'Google-Extended' },
      { userAgent: 'Applebot-Extended' },
      { userAgent: 'CCBot' },
      { userAgent: 'meta-externalagent' },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap-photos.xml`],
  }
}
