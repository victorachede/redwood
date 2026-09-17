import type { MetadataRoute } from 'next'

const SITE_URL = 'https://redwood-sand.vercel.app'

/**
 * The app-shell routes (dashboard, cards, practice, rooms, settings, the
 * tutor itself) are personalized and stateful — there's nothing there for
 * a crawler to index, and letting them in just dilutes the site with thin,
 * per-session pages. Auth utility routes are kept out too: reset-password
 * carries a token in its query string that has no business in a search
 * index or a cache.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/cards',
        '/leaderboard',
        '/practice/',
        '/rooms',
        '/rooms/',
        '/settings',
        '/learn/',
        '/work/',
        '/forgot-password',
        '/reset-password',
        '/offline',
        '/api/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
