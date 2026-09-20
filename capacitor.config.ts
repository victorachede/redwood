import type { CapacitorConfig } from '@capacitor/cli'

/**
 * EWIN ships as a hosted Capacitor app, not a bundled one.
 *
 * The web app has real API routes (tutor, questions, Paystack, Supabase
 * auth) — there is no static export of it to embed. So `server.url` points
 * the WebView straight at the live deployment; `webDir` below is only a
 * placeholder Capacitor requires to exist on disk, and is effectively never
 * shown (see mobile/www/index.html). This also means a content change ships
 * to every install the moment it deploys — no app-store review cycle for
 * anything that isn't native shell code.
 *
 * TODO once a custom domain exists: swap server.url below (and everywhere
 * else redwood-sand.vercel.app is hardcoded — see app/layout.tsx's
 * metadataBase) to the real domain before submitting to either store.
 */
const config: CapacitorConfig = {
  appId: 'com.ewin.app',
  appName: 'EWIN',
  webDir: 'mobile/www',
  server: {
    url: 'https://redwood-sand.vercel.app',
    androidScheme: 'https',
    iosScheme: 'https',
    // Domains the WebView is allowed to navigate to without Capacitor
    // treating it as leaving the app: Google OAuth (Supabase sign-in),
    // Supabase's own auth domain, and Paystack's checkout.
    allowNavigation: [
      'accounts.google.com',
      '*.supabase.co',
      'checkout.paystack.com',
      '*.paystack.co',
    ],
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
