"use client";

import {
  MessageSquare,
  SpellCheck,
  Globe,
  ChartColumn,
  BookOpen,
  Brain,
  Languages,
  Zap,
  Check,
  ChevronDown,
  Crown,
  ArrowRight,
  Sparkles,
  Play,
  Users,
  MessagesSquare,
  Star,
  Menu,
  X,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";

/* ───────────────────────────── NAV ───────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-xl font-bold">
          <MessageSquare className="w-6 h-6 text-accent" />
          <span>Convolo</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted hover:text-foreground transition-colors text-sm"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
          >
            Start Learning Free
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted hover:text-foreground transition-colors text-sm"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium text-center hover:bg-accent-light transition-colors"
            onClick={() => setOpen(false)}
          >
            Start Learning Free
          </a>
        </div>
      )}
    </nav>
  );
}

/* ───────────────────────────── HERO ──────────────────────────── */
function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Now in Public Beta
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight max-w-3xl mx-auto">
          Unlock Fluency Through
          <br />
          <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">
            Real Conversations
          </span>
        </h1>

        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Stop memorizing flashcards. Start having real conversations with an AI
          tutor that adapts to your level, corrects your mistakes, and helps you
          build confidence — one chat at a time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="px-8 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-light transition-colors flex items-center gap-2"
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <button className="px-8 py-3 rounded-full border border-border text-foreground font-medium hover:bg-surface-light transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {[
            { icon: Users, value: "10,000+", label: "Learners" },
            { icon: MessagesSquare, value: "500K+", label: "Conversations" },
            { icon: Globe, value: "4", label: "Languages (More Soon)" },
            { icon: Star, value: "4.9/5", label: "Rating" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FEATURES ────────────────────────── */
const features = [
  {
    icon: MessageSquare,
    title: "AI Conversations",
    desc: "Practice real dialogues with an intelligent AI tutor that responds naturally and keeps the conversation flowing.",
  },
  {
    icon: SpellCheck,
    title: "Instant Corrections",
    desc: "Get real-time grammar, vocabulary, and phrasing corrections — explained in context, not just marked wrong.",
  },
  {
    icon: Globe,
    title: "Real-World Scenarios",
    desc: "From ordering coffee to business meetings — practice the situations you'll actually face.",
  },
  {
    icon: ChartColumn,
    title: "Track Your Progress",
    desc: "Watch your fluency grow with detailed analytics, streaks, and achievements that keep you motivated.",
  },
  {
    icon: BookOpen,
    title: "Smart Vocabulary Book",
    desc: "Words you encounter are automatically saved with spaced repetition to make them stick forever.",
  },
  {
    icon: Brain,
    title: "Adaptive Difficulty",
    desc: "The AI adjusts to your level in real-time — challenging enough to grow, easy enough to keep going.",
  },
];

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything You Need to Speak Fluently
          </h2>
          <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
            Powerful features designed to make language learning feel natural,
            effective, and actually enjoyable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-6 hover:border-accent/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── HOW IT WORKS ───────────────────────── */
const steps = [
  {
    num: 1,
    title: "Pick Your Languages",
    desc: "Choose your native language and target language",
    icon: Languages,
  },
  {
    num: 2,
    title: "Start Talking",
    desc: "Jump into a conversation with your AI tutor",
    icon: MessageSquare,
  },
  {
    num: 3,
    title: "Get Feedback",
    desc: "Receive instant corrections and vocabulary",
    icon: SpellCheck,
  },
  {
    num: 4,
    title: "Level Up",
    desc: "Track progress and unlock achievements",
    icon: Zap,
  },
];

function HowItWorks() {
  return (
    <section className="py-24 bg-surface/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-muted text-lg">
            From zero to fluent in four simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="relative text-center">
              {/* Connector line (hidden on last) */}
              {num < 4 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" />
              )}
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto mb-4 relative z-10">
                <Icon className="w-8 h-8 text-accent" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                  {num}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── PRICING ──────────────────────────── */
function Pricing() {
  const freeFeatures = [
    "3 conversations/day",
    "Basic scenarios",
    "Limited vocabulary book",
    "Basic progress tracking",
  ];
  const proFeatures = [
    "Unlimited conversations",
    "All scenarios including premium",
    "Full vocabulary book + SRS",
    "Detailed analytics & reports",
    "Priority AI responses",
    "Early access to new features",
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-muted text-lg">
            Start free, upgrade when you're ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-surface p-8 flex flex-col">
            <h3 className="text-2xl font-bold mb-1">Free</h3>
            <p className="text-muted text-sm mb-6">
              Get started with the basics
            </p>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-base font-normal text-muted">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full border border-border text-foreground font-medium hover:bg-surface-light transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-accent bg-surface p-8 flex flex-col relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-xs font-bold">
              Most Popular
            </span>
            <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              Pro
            </h3>
            <p className="text-muted text-sm mb-6">
              Everything you need for fluency
            </p>
            <div className="text-4xl font-bold mb-1">
              $9.99
              <span className="text-base font-normal text-muted">/month</span>
            </div>
            <p className="text-muted text-sm mb-6">
              or $79.99/year
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-light transition-colors">
              Start Pro Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── FAQ ────────────────────────────── */
const faqs = [
  {
    q: "How does Convolo teach languages?",
    a: "Convolo uses AI-powered conversation practice to teach languages naturally. Instead of memorizing vocabulary lists, you learn by having real conversations with an AI tutor that adapts to your level, provides instant corrections, and introduces new words and grammar in context — just like how you learned your first language.",
  },
  {
    q: "Can I use Convolo as a complete beginner?",
    a: "Yes, absolutely! Convolo adapts to your level from day one. If you're a complete beginner, the AI will start with simple phrases and gradually increase complexity as you build confidence. The adaptive difficulty system ensures you're always challenged but never overwhelmed.",
  },
  {
    q: "What languages are available?",
    a: "Currently, Convolo supports Spanish, French, German, and Japanese — with more languages coming soon. We're actively working on adding Portuguese, Italian, Korean, and Mandarin Chinese based on user demand.",
  },
  {
    q: "Is my conversation data private?",
    a: "Yes. Your conversation data is encrypted and never shared with third parties. We use your practice data only to personalize your learning experience and provide progress insights. You can delete your data at any time from your account settings.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. There are no long-term contracts or cancellation fees. You can cancel your Pro subscription at any time from your account settings, and you'll retain access until the end of your current billing period. No questions asked.",
  },
  {
    q: "How is Convolo different from Duolingo or other apps?",
    a: "While Duolingo focuses on gamified exercises and flashcards, Convolo focuses on real conversation practice. Our AI tutor responds naturally, adapts in real-time, and provides contextual corrections — simulating a real language partner. This approach builds actual speaking confidence and fluency, not just pattern recognition.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-24 bg-surface/50">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-4">
          {faqs.map(({ q, a }, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              <Accordion.Trigger className="accordion-trigger group">
                <span className="text-left">{q}</span>
                <ChevronDown className="chevron w-4 h-4 text-muted shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
              <Accordion.Content className="accordion-content">
                <div className="px-6 pb-4 text-muted leading-relaxed">
                  {a}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

/* ────────────────────────── CTA BANNER ───────────────────────── */
function CtaBanner() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-accent to-cyan p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Speaking?
          </h2>
          <p className="relative text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of learners building fluency through real practice.
          </p>
          <a
            href="#pricing"
            className="relative inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-accent font-medium hover:bg-white/90 transition-colors"
          >
            Start Your Free Account
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 text-xl font-bold mb-4">
              <MessageSquare className="w-6 h-6 text-accent" />
              Convolo
            </a>
            <p className="text-muted text-sm leading-relaxed">
              Conversation, Unlocked. Master any language through real
              conversations with AI.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">
              Product
            </h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "FAQ"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">
              Legal
            </h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted">
          &copy; 2026 Convolo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────── PAGE ────────────────────────────── */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
