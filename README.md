# Convolo — local-first language-learning MVP

Convolo is a complete language-learning workspace built with Next.js. Its core learning experience works locally in the browser; an **optional Firebase account and Firestore sync layer** can be enabled for a deployed product without changing the local-first path.

> **Scope:** Tutor feedback is deterministic guided practice running in the browser—not a pretend live AI tutor. The new device audio controls use browser text-to-speech. Neither sends learner phrases to an AI service.

## What works

- Responsive landing, onboarding, login/demo path, workspace navigation, privacy, and terms pages
- Four target-language paths: Spanish, French, German, and Japanese
- Safe language switching: vocabulary, conversations, drafts, activity, level, daily goal, placement result, and review state stay isolated per target language
- Guided café, introductions, directions, and hotel conversations with local tutor feedback, translations, phrase extraction, and device audio playback
- A six-question per-language **placement check** that saves a recommendation without silently changing the learner’s selected level
- An adaptive learning-plan page that prioritizes a placement check, fragile due cards, or an appropriate next conversation
- SM-2-inspired adaptive review scheduling with Again, Hard, Good, and Easy ratings, lapse tracking, and a fragile-card-first queue
- Protected JSON export, inspection-before-restore, explicit replacement confirmation, and one-time restore rollback
- Optional Firebase email/password accounts and manual cross-device cloud sync with optimistic revisions and conflict decisions
- PWA manifest, offline shell, install guidance, and optional best-effort browser/PWA review reminders
- Accessibility preferences for text scale, high contrast, reduced motion, a keyboard skip link, and an English interface localization foundation that is separate from learning-language selection

## Running locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For an externally accessible preview, bind Next to all interfaces:

```bash
npm run dev -- --hostname 0.0.0.0
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The test suite covers V1–V4 local-data migration, malformed storage, per-language settings, V4 placement/review/workspace data, and adaptive scheduling behavior.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/login` | Local-profile entry point and demo launcher |
| `/onboarding` | Three-step learning setup |
| `/app` | Learning overview dashboard |
| `/app/plan` | Adaptive plan, placement check, and audio lab |
| `/app/practice` | Guided conversation studio |
| `/app/vocabulary` | Vocabulary library and adaptive review queue |
| `/app/progress` | Progress charts and milestones |
| `/app/settings` | Profile, language switching, backups, optional cloud sync, accessibility, reminders, and reset |
| `/privacy` | Data and connected-feature privacy notice |
| `/terms` | MVP usage terms |

## Optional Firebase cloud sync

Cloud sync is deliberately **off** unless all four public environment values are configured. In that state, the app remains fully usable with browser-local storage and shows a clear setup note instead of a broken sign-in form.

Firebase is used here instead of Supabase because one Firebase project can provide Authentication and Firestore for this application. The browser Firebase configuration values identify a web app; the real protection comes from Firebase Authentication and Firestore security rules.

### Deploy setup

1. Create a Firebase project and register a Web app.
2. In **Authentication → Sign-in method**, enable **Email/Password** and add your production domain (for example, the Vercel/custom domain) under **Authentication → Settings → Authorized domains**.
3. Create a Firestore database. Apply [`firebase/firestore.rules`](firebase/firestore.rules) exactly, either by pasting it into the Firebase Console or with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```

4. Add these values from the Firebase Web app configuration to your deployment environment (for example, Vercel). Copy [`.env.example`](.env.example); do **not** commit a real `.env.local` file:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

5. Redeploy. The **Optional cloud sync** card in Settings will then show account creation/sign-in.

### Sync safety model

- Cloud accounts are optional; no account is created during onboarding.
- On a new device, Convolo shows the local and cloud decision before replacing either one.
- **Sync now** uses a Firestore transaction and revision number. A stale device cannot silently overwrite a newer cloud snapshot.
- A conflict pauses syncing and offers explicit **Restore cloud here** or **Replace cloud** actions.
- A JSON import never updates cloud data automatically. Restore locally, inspect it, then choose **Sync now** if that is desired.
- Each cloud snapshot is capped at 800 KB to avoid Firestore’s document-size limit. If the cap is reached, export a local backup before reducing data; nothing is truncated or silently discarded.

This implementation does not add Convolo-managed end-to-end encryption. Firebase transport/storage protections and your Firebase project configuration apply; publish an appropriate production privacy policy before collecting real user data.

## Backups and restore

Settings → **Backups and restore** exports the full V4 workspace as JSON. Importing a file:

1. limits the browser-read file to 5 MB;
2. parses and defensively normalizes it before showing any restore action;
3. displays a summary before replacement;
4. replaces—not merges—local activity only after a second confirmation; and
5. retains one local pre-restore rollback, which itself needs confirmation before use.

Replacing rather than guessing how to merge activity ledgers avoids duplicate XP, time, conversations, or vocabulary caused by importing the same backup twice.

## PWA and reminders

`src/app/manifest.ts` and `public/sw.js` make the site installable over HTTPS. The service worker caches the app shell and stores an on-device reminder preference. Background/periodic sync is browser-dependent, so reminder timing is explicitly best-effort; the in-app due queue remains the reliable review prompt. Use the browser’s **Install app** or **Add to Home Screen** action, then opt into notification permission from Settings.

## Local data, migration, and privacy

The browser key remains `convolo.local-learning-data.v1`; the stored schema is now **V4**. It contains the profile, language-isolated activity and preferences, vocabulary review state, placement results, workspace accessibility/reminder preferences, conversations, and achievements.

V1, V2, and V3 browser data migrates safely on load. Legacy activity and profile preferences stay with the target language that was active at the time. Missing or malformed records are normalized to safe values; a corrupt storage payload is not allowed to break the workspace.

Switching a target language does **not** change the site’s interface language. It never wipes or merges the old language path, and Settings protects against stale unsaved level/goal fields being copied into another path.

## Architecture

```text
src/
├── app/                 # App Router pages, PWA manifest, global styles
├── components/          # Workspace, plan, audio, cloud, backup, and settings UI
└── lib/
    ├── catalog.ts       # Language/scenario content and level-aware local tutor guidance
    ├── cloud-sync.ts    # Firestore snapshot, revision, size, and conflict safeguards
    ├── firebase-client.ts # Optional client-only Firebase initialization
    ├── learning-data.ts # V1/V2/V3 → V4 validation and migration
    ├── placement.ts     # Question banks and adaptive next-step recommendation
    ├── review-scheduling.ts # Deterministic adaptive spaced-repetition scheduling
    └── types.ts         # Shared data model
firebase/
└── firestore.rules      # Per-user Firestore security rules for optional sync
public/
└── sw.js                # Offline shell and best-effort local reminder worker
scripts/
└── test-learning-data.mjs # Migration and scheduling tests
```

`src/components/learning-provider.tsx` remains the client-side state boundary. It validates browser data after hydration, persists local learning actions, creates a rollback before a confirmed restore, and exposes narrowly scoped actions to the rest of the interface.

## Still needed for a full commercial product

- A protected server-side AI tutor route with moderation, rate limits, and audit controls
- A complete Arabic (and additional) interface message catalog before enabling those interface locales
- Reliable cross-platform push delivery backed by a server/push provider, rather than browser best-effort periodic sync
- Account recovery, email verification, deletion requests, retention policy, and support processes
- Billing and webhook-backed subscription state if paid plans are required
