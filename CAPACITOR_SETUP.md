# Capacitor Mobile App Setup

PicPop is configured to run as a native iOS and Android app via [Capacitor](https://capacitorjs.com/).

## Prerequisites

- **Android**: [Android Studio](https://developer.android.com/studio) + JDK 17
- **iOS** (Mac only): [Xcode](https://developer.apple.com/xcode/)
- **Node.js** 18+

## Workflow

### 1. Build the web app

```bash
npm run build
```

This creates the `out/` folder with the static Next.js export.

### 2. Sync to native projects

```bash
npx cap sync
```

This copies `out/` into the Android and iOS projects.

### 3. Open in native IDE

**Android:**
```bash
npm run cap:android
```

**iOS** (Mac only):
```bash
npm run cap:ios
```

Then build and run from Android Studio or Xcode.

### 4. Quick sync (build + copy)

```bash
npm run cap:sync
```

## What Changed

- **Next.js**: Added `output: "export"` for static site generation
- **Route**: `/f/[imageId]` → `/f?imageId=xxx` (required for static export)
- **Note**: With static export, middleware is not supported. Old links `/f/old-id` will 404; use `/f?imageId=old-id` for new shares.
- **Capacitor**: `capacitor.config.ts`, `android/`, `ios/` folders

## Configuration

Edit `capacitor.config.ts`:

- **appId**: Change to your bundle ID (e.g. `com.yourcompany.picpop`)
- **appName**: App display name
- **webDir**: `out` (Next.js static output)
- **server.url**: Uncomment to load from `http://localhost:3000` during dev

## Publishing

- **Android**: Build release APK/AAB in Android Studio → [Google Play Console](https://play.google.com/console)
- **iOS**: Archive in Xcode → [App Store Connect](https://appstoreconnect.apple.com/)

## Troubleshooting

- **Build fails**: Run `npm run build` and fix any errors before `cap sync`
- **White screen**: Ensure Firebase env vars are set (`.env.local`)
- **Fonts not loading**: Build requires network access for Google Fonts
