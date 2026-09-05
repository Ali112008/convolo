import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Brand } from "./brand";

type LegalKind = "privacy" | "terms";

const content = {
  privacy: {
    eyebrow: "PRIVACY",
    title: "Your learning data stays with you.",
    intro:
      "Convolo stays local-first by default. It does not send analytics or submit your conversation text to a remote AI service. Optional cloud sync is shown only when its Firebase deployment configuration has been enabled.",
    sections: [
      {
        heading: "What the app stores locally",
        body: "The app stores your local profile, selected language, placement result, practice history, vocabulary, review schedule, reminder preference, and progress in browser localStorage. This lets the workspace survive a refresh on the same browser.",
      },
      {
        heading: "When data leaves your device",
        body: "Nothing in the learning workspace is intentionally sent to a Convolo learning server by default. If you configure Firebase, create or sign in to an optional account, and explicitly choose Sync now, the current workspace snapshot is sent to your Firebase Firestore project so you can use it on another signed-in device.",
      },
      {
        heading: "Audio and reminders",
        body: "The audio controls use your browser or device text-to-speech capability. Convolo does not upload phrases for playback. Optional PWA reminders are requested from your browser only after you opt in and grant notification permission.",
      },
      {
        heading: "Your controls",
        body: "You can export a JSON backup, inspect a backup before restoring it, undo the latest restore once, sign out of cloud sync, or erase all local data from Settings. Cloud restore and conflict screens ask for a deliberate choice before replacing either copy.",
      },
      {
        heading: "Cloud deployment responsibility",
        body: "A deployment owner enabling Firebase must use the included Firestore security rules, secure the Firebase project, and publish contact, retention, and deletion policies appropriate for their users and jurisdiction.",
      },
    ],
  },
  terms: {
    eyebrow: "TERMS",
    title: "A clear agreement for this local-first workspace.",
    intro:
      "Convolo is a guided language-practice tool, not a substitute for a teacher, translator, professional assessment, or emergency service.",
    sections: [
      {
        heading: "Using the learning tools",
        body: "You may use conversations, placement checks, adaptive recommendations, audio playback, and vocabulary review for personal practice. Tutor feedback and placement results are deterministic guidance, so verify important translations or high-stakes language with a qualified source.",
      },
      {
        heading: "Local data and backups",
        body: "You remain responsible for backups you choose to keep. Restore intentionally replaces the current local workspace after confirmation; Convolo creates one local rollback copy, but it is not a permanent archive.",
      },
      {
        heading: "Optional cloud accounts",
        body: "Cloud sync is optional and available only on deployments configured with Firebase. You choose whether a local or cloud workspace is restored or uploaded. Do not share your account password, and sign out on shared devices.",
      },
      {
        heading: "Availability and notifications",
        body: "There is no payment or subscription feature in this version. PWA installation, browser voices, and background reminder timing depend on browser and device support and are provided on a best-effort basis.",
      },
      {
        heading: "Future production terms",
        body: "A public hosted service may need additional terms covering its connected-service providers, applicable privacy law, support commitments, retention, and any future billing.",
      },
    ],
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];

  return (
    <main className="legal-page">
      <header className="legal-header container">
        <Brand />
        <Link className="text-link" href="/"><ArrowLeft size={16} /> Back to home</Link>
      </header>
      <article className="legal-content container">
        <div className="legal-icon"><ShieldCheck size={24} /></div>
        <span className="section-label">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p className="legal-intro">{page.intro}</p>
        <div className="legal-sections">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <div className="legal-footer-note">
          <p>Last updated: September 5, 2026</p>
          <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
      </article>
    </main>
  );
}
