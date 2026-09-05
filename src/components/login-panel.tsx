"use client";

import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Brand } from "./brand";
import { useLearning } from "./learning-provider";

export function LoginPanel() {
  const router = useRouter();
  const { data, hydrated, prepareLearner, startDemo } = useLearning();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (hydrated && data.profile?.onboarded) {
      router.replace("/app");
    }
  }, [data.profile?.onboarded, hydrated, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    prepareLearner({ name, email });
    router.push("/onboarding");
  }

  function handleDemo() {
    startDemo();
    router.push("/app");
  }

  return (
    <main className="login-page">
      <div className="login-panel-wrap">
        <div className="login-brand-link">
          <Brand />
        </div>
        <section className="login-card">
          <div className="login-icon"><Sparkles size={22} /></div>
          <span className="step-overline">LOCAL WORKSPACE</span>
          <h1>Continue your learning setup.</h1>
          <p>
            Convolo is running in local-first mode. Enter a name to create a profile
            in this browser, then choose your language path.
          </p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="login-name">Name</label>
            <input
              className="text-input"
              id="login-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              maxLength={40}
              required
            />
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              className="text-input"
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <button className="button button-primary button-full" type="submit">
              Continue to setup <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-divider"><span>or</span></div>
          <button className="button button-secondary button-full" type="button" onClick={handleDemo}>
            Explore with demo data <ArrowRight size={17} />
          </button>
          <div className="local-note">
            <LockKeyhole size={16} />
            <span>No password or remote account is required.</span>
          </div>
        </section>
        <div className="login-benefits">
          <span><CheckCircle2 size={16} /> Guided practice scenarios</span>
          <span><CheckCircle2 size={16} /> Vocabulary review queue</span>
          <span><CheckCircle2 size={16} /> Progress saved locally</span>
        </div>
      </div>
    </main>
  );
}
