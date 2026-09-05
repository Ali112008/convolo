"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleUserRound,
  Clock3,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { useLearning } from "./learning-provider";
import { LEVELS, NATIVE_LANGUAGES, TARGET_LANGUAGES } from "@/lib/catalog";
import type { LearningLevel, TargetLanguage } from "@/lib/types";

interface SetupForm {
  name: string;
  email: string;
  nativeLanguage: string;
  targetLanguage: TargetLanguage;
  level: LearningLevel;
  dailyGoal: number;
}

const INITIAL_FORM: SetupForm = {
  name: "",
  email: "",
  nativeLanguage: "Arabic",
  targetLanguage: "spanish",
  level: "starter",
  dailyGoal: 10,
};

export function OnboardingFlow() {
  const router = useRouter();
  const { data, hydrated, completeOnboarding, startDemo } = useLearning();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SetupForm>(INITIAL_FORM);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const savedName = data.profile?.name ?? "";
  const savedEmail = data.profile?.email ?? "";
  const resolvedName = nameTouched ? form.name : savedName || form.name;
  const resolvedEmail = emailTouched ? form.email : savedEmail || form.email;

  useEffect(() => {
    if (hydrated && data.profile?.onboarded) {
      router.replace("/app");
    }
  }, [data.profile?.onboarded, hydrated, router]);

  function goForward() {
    if (step === 1) {
      if (!resolvedName.trim() || !resolvedEmail.trim()) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    completeOnboarding({ ...form, name: resolvedName, email: resolvedEmail });
    router.push("/app");
  }

  function goBack() {
    if (step === 1) {
      router.push("/");
      return;
    }
    setStep((current) => current - 1);
  }

  function launchDemo() {
    startDemo();
    router.push("/app");
  }

  if (!hydrated) {
    return <SetupLoading />;
  }

  return (
    <main className="setup-page">
      <div className="setup-orb setup-orb-one" aria-hidden="true" />
      <div className="setup-orb setup-orb-two" aria-hidden="true" />
      <div className="setup-topbar container">
        <Brand />
        <button className="text-link" type="button" onClick={launchDemo}>
          Explore demo data
        </button>
      </div>
      <section className="setup-shell">
        <aside className="setup-aside">
          <div className="setup-aside-content">
            <span className="eyebrow"><Sparkles size={15} /> Your learning space</span>
            <h1>Let&apos;s make your first conversation feel approachable.</h1>
            <p>
              This short setup personalizes the scenarios, daily goal, and review queue in your local workspace.
            </p>
            <div className="setup-promises">
              <span><ShieldCheck size={17} /> Starts privately in this browser</span>
              <span><Globe2 size={17} /> Four guided language paths</span>
              <span><Clock3 size={17} /> Ready in less than a minute</span>
            </div>
          </div>
          <div className="setup-quote">
            <span className="quote-mark">“</span>
            <p>Small conversations, repeated often, add up to a voice you trust.</p>
            <span>— The Convolo approach</span>
          </div>
        </aside>

        <div className="setup-panel">
          <div className="setup-progress" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((item) => (
              <span className={item <= step ? "progress-active" : ""} key={item}>
                {item < step ? <Check size={14} /> : item}
              </span>
            ))}
            <i className="progress-line" />
            <i className="progress-line progress-line-two" />
          </div>

          {step === 1 && (
            <div className="setup-step">
              <span className="step-overline">STEP 1 OF 3</span>
              <h2>What should we call you?</h2>
              <p>Use any name you would like to see in your workspace. No server account is created.</p>
              <label className="field-label" htmlFor="learner-name">Your name</label>
              <div className="input-with-icon">
                <CircleUserRound size={18} />
                <input
                  id="learner-name"
                  value={resolvedName}
                  onChange={(event) => {
                    setNameTouched(true);
                    setForm({ ...form, name: event.target.value });
                  }}
                  placeholder="e.g. Alex"
                  autoComplete="name"
                  maxLength={40}
                />
              </div>
              <label className="field-label" htmlFor="learner-email">Email for this local profile</label>
              <input
                className="text-input"
                id="learner-email"
                type="email"
                value={resolvedEmail}
                onChange={(event) => {
                  setEmailTouched(true);
                  setForm({ ...form, email: event.target.value });
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <p className="field-help">It stays on this device and is never sent anywhere.</p>
            </div>
          )}

          {step === 2 && (
            <div className="setup-step">
              <span className="step-overline">STEP 2 OF 3</span>
              <h2>Choose your conversation path.</h2>
              <p>You can refine your level and daily goal in the next step.</p>
              <span className="field-label">I speak</span>
              <select
                className="select-input"
                value={form.nativeLanguage}
                onChange={(event) => setForm({ ...form, nativeLanguage: event.target.value })}
                aria-label="Native language"
              >
                {NATIVE_LANGUAGES.map((language) => <option key={language}>{language}</option>)}
              </select>
              <span className="field-label target-label">I want to practice</span>
              <div className="language-choices">
                {TARGET_LANGUAGES.map((language) => {
                  const selected = form.targetLanguage === language.id;
                  return (
                    <button
                      className={`language-choice ${selected ? "language-selected" : ""}`}
                      type="button"
                      key={language.id}
                      onClick={() => setForm({ ...form, targetLanguage: language.id })}
                    >
                      <span className="language-flag">{language.flag}</span>
                      <span>
                        <strong>{language.label}</strong>
                        <small>{language.nativeLabel}</small>
                      </span>
                      {selected && <Check size={17} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-step">
              <span className="step-overline">STEP 3 OF 3</span>
              <h2>Set a pace that you can keep.</h2>
              <p>Consistent short sessions beat a heroic plan that disappears after a week.</p>
              <span className="field-label">Your current level</span>
              <div className="level-choices">
                {LEVELS.map((level) => {
                  const selected = form.level === level.id;
                  return (
                    <button
                      type="button"
                      className={`level-choice ${selected ? "level-selected" : ""}`}
                      key={level.id}
                      onClick={() => setForm({ ...form, level: level.id })}
                    >
                      <span className="level-check">{selected && <Check size={14} />}</span>
                      <span>
                        <strong>{level.title}</strong>
                        <small>{level.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="field-label target-label">Daily conversation goal</span>
              <div className="goal-choices">
                {[5, 10, 15, 20].map((minutes) => (
                  <button
                    className={form.dailyGoal === minutes ? "goal-selected" : ""}
                    type="button"
                    key={minutes}
                    onClick={() => setForm({ ...form, dailyGoal: minutes })}
                  >
                    <strong>{minutes}</strong>
                    <small>minutes</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="setup-actions">
            <button className="button button-ghost" type="button" onClick={goBack}>
              <ArrowLeft size={17} /> {step === 1 ? "Back home" : "Back"}
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={goForward}
              disabled={step === 1 && (!resolvedName.trim() || !resolvedEmail.trim())}
            >
              {step === 3 ? "Open my workspace" : "Continue"} <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SetupLoading() {
  return (
    <main className="loading-page" aria-live="polite">
      <Brand />
      <div className="loading-spinner" />
      <p>Preparing your local learning space…</p>
    </main>
  );
}
