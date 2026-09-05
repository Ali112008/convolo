import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Brand } from "./brand";

type LegalKind = "privacy" | "terms";

const content = {
  privacy: {
    eyebrow: "PRIVACY",
    title: "Your learning data stays with you.",
    intro:
      "This Convolo MVP is built as a local-first demonstration. It does not run a user database, send analytics, or submit your conversation text to a remote AI service.",
    sections: [
      {
        heading: "What the app stores",
        body: "The app stores your local profile, selected language, practice history, vocabulary, and progress in your browser localStorage. This lets the workspace survive a refresh on the same browser.",
      },
      {
        heading: "What leaves your device",
        body: "Nothing in the learning workspace is intentionally sent to a Convolo server because this version has no server-side learning API. The browser may still make normal requests to load the deployed website assets.",
      },
      {
        heading: "Your controls",
        body: "You can download a JSON backup from Settings. You can also erase all local learning data from Settings or by clearing this site’s browser storage.",
      },
      {
        heading: "If cloud features are added",
        body: "A production version with authentication, cloud sync, payments, or an AI provider would require an updated privacy notice before collecting or transmitting personal data.",
      },
    ],
  },
  terms: {
    eyebrow: "TERMS",
    title: "A clear agreement for this local MVP.",
    intro:
      "Convolo is presented here as a self-contained language-learning MVP. It is a guided practice tool, not a substitute for a teacher, translator, or emergency service.",
    sections: [
      {
        heading: "Using the workspace",
        body: "You may use the local learning features for personal practice. The tutor feedback is deterministic guidance designed for demonstration, so verify important translations with a qualified source.",
      },
      {
        heading: "Your local data",
        body: "You are responsible for exporting any learning data you want to keep. Clearing browser storage or using a different browser/device may remove access to that local data.",
      },
      {
        heading: "No paid service in this version",
        body: "This MVP has no account billing, subscription, or payment feature. It does not promise cloud backup or real-time human or AI tutoring.",
      },
      {
        heading: "Future production terms",
        body: "If connected services are added later, the terms will need to be updated to cover those services, their providers, and any applicable billing rules.",
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
