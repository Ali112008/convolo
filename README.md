# Convolo — local-first language-learning MVP

Convolo is a complete, self-contained language-learning MVP built with Next.js. It replaces the original static landing page with an interactive learning workspace that works without a database, API key, authentication provider, or payment service.

> **Important:** this is intentionally a local-first MVP, not a pretend production AI service. Tutor responses are deterministic guided prompts that run in the browser. Learner data is saved to browser `localStorage` only.

## What works

- A polished responsive landing page with working navigation and legal pages
- Local profile setup: native language, target language, learning level, and daily goal
- A demo workspace that can be opened immediately
- Four target-language paths: Spanish, French, German, and Japanese
- Safe target-language switching from Settings: old vocabulary, conversations, unfinished drafts, and per-language activity stay intact
- Four interactive guided scenarios: café, introductions, directions, and hotel check-in
- Local tutor replies, translations, phrase suggestions, vocabulary extraction, and browser text-to-speech controls
- Saved vocabulary with search, filters, custom words, and a simple spaced-review queue
- Per-language XP, practice minutes, turns, streaks, scenario milestones, weekly charts, and daily goals, plus all-time totals
- Profile preferences, protected draft discard, downloadable JSON data export, and full local-data reset
- Privacy and terms pages that accurately describe the local-only data model

## Running locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For an externally accessible development preview, bind Next to all interfaces:

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

The production build does not fetch a Google font or depend on any other remote resource, so it can run in an offline/restricted build environment.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/login` | Local-profile entry point and demo launcher |
| `/onboarding` | Three-step learning setup |
| `/app` | Learning overview dashboard |
| `/app/practice` | Guided conversation studio |
| `/app/vocabulary` | Vocabulary library and review queue |
| `/app/progress` | Progress charts and milestones |
| `/app/settings` | Preferences, export, and reset controls |
| `/privacy` | Local-data privacy notice |
| `/terms` | MVP usage terms |

## Architecture

```text
src/
├── app/                 # App Router routes and global styles
├── components/          # Workspace, onboarding, practice, vocabulary and UI components
└── lib/
    ├── catalog.ts       # Language/scenario content and local tutor guidance
    ├── learning-data.ts # V1/V2→V3 local-data migration and defensive validation
    ├── learning-utils.ts# Date, streak, and statistics utilities
    └── types.ts         # Shared data types
scripts/
└── test-learning-data.mjs # Migration and malformed-storage tests
```

`src/components/learning-provider.tsx` is the client-side state boundary. It validates and loads local data after hydration, persists every learning action to `localStorage`, and exposes actions to the rest of the interface.

## Local data and privacy

The browser key remains `convolo.local-learning-data.v1`; the stored schema is now **V3**. It contains the display name/email supplied during setup, selected learning preferences, conversations, vocabulary, a lifetime activity ledger, and separate activity and level/goal preferences for each target language. Existing V1 and V2 data is migrated safely on load: prior activity and preferences are assigned to the language that was active when they were saved.

Switching target language does **not** wipe or merge records. Convolo preserves the old language path, its level and daily goal, vocabulary, conversations, and unfinished drafts. It adds only missing starter phrases for the new path, and drafts can be resumed after switching back. Use **Settings → Export JSON** before clearing browser storage or resetting the workspace.

## Moving toward production

To evolve this MVP into a hosted product, add these server-side pieces rather than exposing credentials in browser code:

1. Authentication and durable storage (for example, Supabase Auth + Postgres).
2. A protected Next.js route handler/server action that calls an AI provider using a server-only environment variable.
3. Input moderation, rate limiting, audit logging, and proper error handling around the AI route.
4. Cloud sync and migration from the local data schema.
5. A billing provider and webhook-backed subscription state if paid plans are required.
6. Updated privacy policy, terms, consent, and data-retention controls before collecting cloud data.

The current local provider keeps these boundaries explicit, making it possible to replace persistence and tutor actions incrementally.
