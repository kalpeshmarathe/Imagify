# Firebase Setup for Imagify

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add a **Web app** (</> icon) and copy the config values

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 3. Enable Sign-In Methods

In Firebase Console → **Authentication** → **Sign-in method**:

- **Google**: Enable and configure
- **Facebook**: Enable, add App ID & Secret from [Facebook Developers](https://developers.facebook.com/)
- **Yahoo**: Enable, add Client ID & Secret from [Yahoo Developer Network](https://developer.yahoo.com/)

Add authorized domains for your app (e.g. `localhost` for dev, your production domain).

## 4. Firestore Database

1. Create a **Firestore Database** (Production mode)
2. Deploy rules: `firebase deploy --only firestore`
3. Or paste `firestore.rules` content in Console → Firestore → Rules

## 5. Firestore Storage

1. Create **Storage** in Firebase Console
2. Deploy rules: `firebase deploy --only storage`
3. Or paste `storage.rules` in Console → Storage → Rules

## 6. Collections

Firestore will auto-create:

- **users** `/{uid}` — user profile with `coolId`, `displayName`, `email`, `photoURL`
- **usernames** `/{coolId}` — maps cool ID → `uid` for uniqueness checks
- **images** `/{imageId}` — uploaded images (imageUrl, userId, coolId)
- **feedbacks** — anonymous feedback on images (imageId, text)
