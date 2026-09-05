"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Flame,
  Globe2,
  Menu,
  MessageCircleMore,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "./brand";
import { useLearning } from "./learning-provider";

const features = [
  {
    icon: MessageCircleMore,
    title: "Guided conversations",
    description:
      "Practice useful situations with a friendly local tutor, quick replies, translations, and natural phrasing tips.",
  },
  {
    icon: BookOpenCheck,
    title: "Vocabulary that stays with you",
    description:
      "Words from your sessions land in a personal review queue, then come back on a simple spaced schedule.",
  },
  {
    icon: BarChart3,
    title: "Visible progress",
    description:
      "Track practice minutes, turn count, streaks, XP, completed scenarios, and the words you have reviewed.",
  },
  {
    icon: BrainCircuit,
    title: "A learning plan that fits",
    description:
      "Choose your level, language, and daily goal. The workspace keeps the next small step in view.",
  },
];

const faqs = [
  {
    question: "Is this connected to a real AI service?",
    answer:
      "This rebuild is intentionally self-contained. The tutor uses guided, local response logic so every core flow works without an API key, account server, or external database. The code is structured so a real AI route can be added later.",
  },
  {
    question: "Where is my data saved?",
    answer:
      "Your profile, practice history, and vocabulary are stored only in this browser using localStorage. You can export or erase them from Settings at any time.",
  },
  {
    question: "Which languages can I practice?",
    answer:
      "The current MVP includes Spanish, French, German, and Japanese guided scenarios. Arabic is available as a native-language choice during setup.",
  },
  {
    question: "Do I need to pay to use it?",
    answer:
      "No. This local-first MVP has no payment flow and no hidden subscription. It is ready to demonstrate the complete learning journey offline from third-party services.",
  },
];

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data, hydrated } = useLearning();
  const workspaceHref = hydrated && data.profile?.onboarded ? "/app" : "/onboarding";
  const workspaceLabel = hydrated && data.profile?.onboarded ? "Open my workspace" : "Build my learning plan";

  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <div className="container nav-wrap">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="desktop-actions">
            <Link className="text-link" href="/login">
              Continue setup
            </Link>
            <Link className="button button-small button-primary" href={workspaceHref}>
              {workspaceLabel}
            </Link>
          </div>
          <button
            className="icon-button menu-toggle"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav container" aria-label="Mobile navigation">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Continue setup
            </Link>
            <Link className="button button-primary" href={workspaceHref} onClick={() => setMenuOpen(false)}>
              {workspaceLabel}
            </Link>
          </nav>
        )}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={15} />
                Local-first language learning MVP
              </div>
              <h1>
                Conversation is where <span>fluency starts.</span>
              </h1>
              <p className="hero-description">
                Learn through guided, real-world conversations. Build a useful vocabulary,
                notice your progress, and keep every learning record in your own browser.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary button-large" href={workspaceHref}>
                  {workspaceLabel}
                  <ArrowRight size={18} />
                </Link>
                <Link className="button button-ghost button-large" href="/login">
                  <PlayCircle size={18} />
                  Try the demo workspace
                </Link>
              </div>
              <div className="hero-assurances" aria-label="Product assurances">
                <span>
                  <CheckCircle2 size={16} /> No API key needed
                </span>
                <span>
                  <CheckCircle2 size={16} /> Your browser, your data
                </span>
              </div>
            </div>

            <div className="hero-product" aria-label="Convolo product preview">
              <div className="product-window">
                <div className="window-topbar">
                  <div className="window-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>Today&apos;s practice</span>
                  <div className="window-avatar">A</div>
                </div>
                <div className="preview-sidebar">
                  <div className="preview-brand">
                    <MessageCircleMore size={17} /> Convolo
                  </div>
                  <span className="preview-nav preview-nav-active">Overview</span>
                  <span className="preview-nav">Practice</span>
                  <span className="preview-nav">Vocabulary</span>
                  <span className="preview-nav">Progress</span>
                </div>
                <div className="preview-main">
                  <div className="preview-greeting">
                    <div>
                      <span className="preview-kicker">KEEP GOING</span>
                      <strong>Good afternoon, Alex</strong>
                    </div>
                    <span className="preview-streak">
                      <Flame size={15} /> 3
                    </span>
                  </div>
                  <div className="preview-goal">
                    <div className="goal-ring" aria-hidden="true">
                      <span>70%</span>
                    </div>
                    <div>
                      <span className="preview-kicker">DAILY GOAL</span>
                      <strong>7 of 10 minutes</strong>
                      <small>Just one conversation left</small>
                    </div>
                  </div>
                  <div className="preview-lesson">
                    <div className="lesson-icon">
                      <Globe2 size={17} />
                    </div>
                    <div>
                      <span className="preview-kicker">NEXT UP · SPANISH</span>
                      <strong>Order at a neighborhood café</strong>
                      <small>Polite requests · 5 min</small>
                    </div>
                    <span className="preview-play">
                      <Zap size={15} />
                    </span>
                  </div>
                  <div className="preview-message tutor-preview-message">
                    <span>Lucía · Tutor</span>
                    <p>¡Hola! ¿Qué te gustaría tomar?</p>
                    <small>Hello! What would you like to drink?</small>
                  </div>
                  <div className="preview-message learner-preview-message">
                    <p>Quisiera un café, por favor.</p>
                  </div>
                </div>
              </div>
              <div className="floating-card floating-card-xp">
                <Zap size={16} />
                <span>
                  <strong>+12 XP</strong>
                  <small>for speaking up</small>
                </span>
              </div>
              <div className="floating-card floating-card-word">
                <BookOpenCheck size={16} />
                <span>
                  <strong>quisiera</strong>
                  <small>I would like</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="social-proof-section">
          <div className="container proof-row">
            <p>Everything in this MVP is designed to make the next sentence feel easier.</p>
            <div className="proof-points">
              <span><ShieldCheck size={16} /> Browser-only data</span>
              <span><BrainCircuit size={16} /> Guided feedback</span>
              <span><BarChart3 size={16} /> Progress that is yours</span>
            </div>
          </div>
        </section>

        <section className="section section-workflow" id="how-it-works">
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="section-label">A calm, complete loop</span>
              <h2>Make steady progress in three focused steps.</h2>
              <p>There is no complicated setup. Pick a direction, say something, and keep the useful bits.</p>
            </div>
            <div className="steps-grid">
              {[
                {
                  number: "01",
                  title: "Set your direction",
                  body: "Choose your native language, target language, current level, and a daily practice goal.",
                  icon: Globe2,
                },
                {
                  number: "02",
                  title: "Practice out loud",
                  body: "Work through café, travel, directions, and introduction scenarios with a guided tutor.",
                  icon: MessageCircleMore,
                },
                {
                  number: "03",
                  title: "Keep what matters",
                  body: "Review saved phrases, see your activity, and come back tomorrow with a smaller next step.",
                  icon: BookOpenCheck,
                },
              ].map(({ number, title, body, icon: Icon }) => (
                <article className="step-card" key={number}>
                  <div className="step-card-top">
                    <span>{number}</span>
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section features-section" id="features">
          <div className="container feature-layout">
            <div className="feature-intro">
              <span className="section-label">Built for practice, not busywork</span>
              <h2>All the essentials for a useful learning habit.</h2>
              <p>
                Convolo turns isolated study into a loop: speak, understand a better option,
                save the phrase, and see proof that you showed up.
              </p>
              <Link className="inline-link" href={workspaceHref}>
                Explore the workspace <ArrowRight size={16} />
              </Link>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-icon"><Icon size={21} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section local-first-section">
          <div className="container local-first-card">
            <div>
              <span className="section-label">Transparent by design</span>
              <h2>A working product without pretending there is a backend.</h2>
              <p>
                This rebuild stores learning data locally, uses deterministic tutor guidance, and
                gives you export and reset controls. It is a complete demonstrable MVP now, with
                a clean foundation for real authentication, AI, payments, and cloud sync later.
              </p>
            </div>
            <div className="local-first-checklist">
              <span><CheckCircle2 size={18} /> Onboarding and profile</span>
              <span><CheckCircle2 size={18} /> Interactive practice sessions</span>
              <span><CheckCircle2 size={18} /> Vocabulary review scheduling</span>
              <span><CheckCircle2 size={18} /> Streaks, goals, and exports</span>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="container narrow-container">
            <div className="section-heading centered-heading">
              <span className="section-label">Questions, answered clearly</span>
              <h2>Know exactly what you are opening.</h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article className={`faq-item ${isOpen ? "faq-open" : ""}`} key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={19} />
                    </button>
                    {isOpen && <p>{faq.answer}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="container cta-card">
            <div className="cta-glow" aria-hidden="true" />
            <div>
              <span className="section-label">Your first small win is ready</span>
              <h2>Start a conversation you can finish today.</h2>
              <p>Set up your local learning workspace in under a minute.</p>
            </div>
            <Link className="button button-light button-large" href={workspaceHref}>
              {workspaceLabel}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="container footer-row">
          <Brand compact />
          <p>Conversation, unlocked. Local-first by default.</p>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>© 2026 Convolo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
