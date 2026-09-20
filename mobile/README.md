# EWIN — native wrapper

Capacitor wraps the live web app in a native shell. It does **not** bundle a
static copy — `capacitor.config.ts` points the WebView straight at
`https://redwood-sand.vercel.app`, so a deploy ships to every install
immediately, no store review needed for anything except native shell code
itself (icons, splash, plugins).

This sandbox has no Android SDK or Xcode, so the two platform projects
(`android/`, `ios/`) are scaffolded and configured but never built here —
that needs a real machine.

## Before you touch this again

- **Custom domain**: once EWIN has one, update `server.url` in
  `capacitor.config.ts` (and `metadataBase` in `app/layout.tsx`) before
  submitting to either store. Shipping a store listing pointed at a
  `vercel.app` URL is fine for testing, not for release.
- **Signing**: neither platform is set up with real signing credentials.
  Android needs a release keystore (Play Store requires app signing either
  way — Play App Signing is the easy path). iOS needs an Apple Developer
  account, a bundle identifier registered to it, and provisioning profiles.

## Android (Play Store)

Needs [Android Studio](https://developer.android.com/studio) (bundles the
SDK).

```
npm run build && npm run cap:sync   # after any web change or config edit
npm run cap:android                 # opens android/ in Android Studio
```

From Android Studio: Run on a device/emulator to test, or Build → Generate
Signed Bundle for a Play Store `.aab`.

## iOS (App Store)

Needs a Mac with Xcode. The project uses Swift Package Manager (no
CocoaPods step).

```
npm run build && npm run cap:sync
npm run cap:ios                     # opens ios/App in Xcode
```

## What still needs real-device verification

- Google sign-in (Supabase OAuth) completing inside the WebView —
  `allowNavigation` in `capacitor.config.ts` permits `accounts.google.com`,
  but this has not been tested on a device.
- Paystack checkout — it currently opens via a full navigation inside the
  same WebView (same as the web app). That works, but a payment provider
  sees "WebView" rather than a real browser, which is worse for user trust
  and occasionally something providers actively restrict. Worth revisiting
  with `@capacitor/browser` (open checkout in a Chrome Custom
  Tab / SFSafariViewController instead) once there's a device to test the
  return-to-app flow on.
- Service worker behavior inside the Capacitor WebView — registers fine in
  a regular mobile browser (verified), not yet confirmed inside the native
  shell specifically.
- The Android hardware back button handling in `components/CapacitorBridge.tsx`.
