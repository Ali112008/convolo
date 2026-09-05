"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleUserRound,
  Database,
  Download,
  Globe2,
  Info,
  Languages,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, NATIVE_LANGUAGES, getLanguageLabel } from "@/lib/catalog";
import type { LearningLevel } from "@/lib/types";
import { useLearning } from "./learning-provider";

export function SettingsPanel() {
  const router = useRouter();
  const { data, stats, updateProfile, resetLearningData } = useLearning();
  const profile = data.profile;
  const [name, setName] = useState(() => profile?.name ?? "");
  const [nativeLanguage, setNativeLanguage] = useState(() => profile?.nativeLanguage ?? "Arabic");
  const [level, setLevel] = useState<LearningLevel>(() => profile?.level ?? "starter");
  const [dailyGoal, setDailyGoal] = useState(() => profile?.dailyGoal ?? 10);
  const [saved, setSaved] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!profile) return null;

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), nativeLanguage, level, dailyGoal });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function exportData() {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `convolo-learning-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function resetAllData() {
    resetLearningData();
    router.push("/");
  }

  return (
    <div className="workspace-section settings-page">
      <section className="page-title-row">
        <div>
          <span className="section-label">LOCAL WORKSPACE SETTINGS</span>
          <h1>Make this learning space yours.</h1>
          <p>Update your practice preferences, take your data with you, or clear the local workspace completely.</p>
        </div>
        <div className="settings-status"><ShieldCheck size={17} /> Stored in this browser</div>
      </section>

      <section className="settings-layout">
        <div className="settings-main-column">
          <article className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-card-icon"><CircleUserRound size={20} /></span>
              <div><h2>Learning profile</h2><p>These details personalize your workspace.</p></div>
            </div>
            <form className="settings-form" onSubmit={saveProfile}>
              <div className="settings-form-grid">
                <label className="field-label" htmlFor="settings-name">Display name
                  <input className="text-input" id="settings-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required />
                </label>
                <label className="field-label" htmlFor="settings-native-language">Native language
                  <select className="select-input" id="settings-native-language" value={nativeLanguage} onChange={(event) => setNativeLanguage(event.target.value)}>
                    {NATIVE_LANGUAGES.map((language) => <option key={language}>{language}</option>)}
                  </select>
                </label>
              </div>
              <div className="settings-focus-box">
                <Languages size={19} />
                <span><small>TARGET LANGUAGE</small><strong>{getLanguageLabel(profile.targetLanguage)}</strong></span>
                <span className="focus-lock"><LockKeyhole size={14} /> Fixed for this local path</span>
              </div>
              <div className="settings-form-grid">
                <label className="field-label" htmlFor="settings-level">Current level
                  <select className="select-input" id="settings-level" value={level} onChange={(event) => setLevel(event.target.value as LearningLevel)}>
                    {LEVELS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </label>
                <fieldset className="field-label goal-fieldset">
                  <legend>Daily goal</legend>
                  <div className="compact-goal-choices">
                    {[5, 10, 15, 20].map((minutes) => (
                      <button className={dailyGoal === minutes ? "compact-goal-selected" : ""} type="button" key={minutes} onClick={() => setDailyGoal(minutes)}>{minutes} min</button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="settings-save-row">
                <span>{saved && <><CheckCircle2 size={16} /> Changes saved locally</>}</span>
                <button className="button button-primary" type="submit"><Save size={17} /> Save preferences</button>
              </div>
            </form>
          </article>

          <article className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-card-icon settings-card-icon-blue"><Database size={20} /></span>
              <div><h2>Your learning data</h2><p>Everything below lives only on this device.</p></div>
            </div>
            <div className="data-summary-row">
              <span><strong>{data.conversations.length}</strong><small>conversations</small></span>
              <span><strong>{data.vocabulary.length}</strong><small>saved words</small></span>
              <span><strong>{stats.totalXp}</strong><small>XP earned</small></span>
            </div>
            <div className="data-action-row">
              <div><h3>Export a backup</h3><p>Download a JSON copy of your profile, activity, conversations, and vocabulary.</p></div>
              <button className="button button-secondary" type="button" onClick={exportData}><Download size={17} /> Export JSON</button>
            </div>
          </article>

          <article className="settings-card danger-card">
            <div className="settings-card-heading">
              <span className="settings-card-icon settings-card-icon-danger"><AlertTriangle size={20} /></span>
              <div><h2>Reset local workspace</h2><p>This is useful if you want to begin with a different target language.</p></div>
            </div>
            {!confirmingReset ? (
              <div className="data-action-row">
                <div><h3>Delete this browser&apos;s learning data</h3><p>Your profile, conversations, progress, and vocabulary will be erased from localStorage.</p></div>
                <button className="button button-danger" type="button" onClick={() => setConfirmingReset(true)}><Trash2 size={17} /> Reset data</button>
              </div>
            ) : (
              <div className="reset-confirmation">
                <div><AlertTriangle size={19} /><span><strong>Are you sure?</strong><small>This cannot be undone unless you exported a backup first.</small></span></div>
                <div><button className="button button-ghost" type="button" onClick={() => setConfirmingReset(false)}>Keep my data</button><button className="button button-danger" type="button" onClick={resetAllData}>Yes, erase everything</button></div>
              </div>
            )}
          </article>
        </div>

        <aside className="settings-side-column">
          <article className="local-mode-card">
            <span className="local-mode-icon"><Globe2 size={22} /></span>
            <span className="card-kicker">HOW THIS MVP RUNS</span>
            <h2>Private by default.</h2>
            <p>No login service, database, analytics tracker, or AI request is used in this self-contained version.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Your text stays in this browser</li>
              <li><CheckCircle2 size={16} /> You can export at any time</li>
              <li><CheckCircle2 size={16} /> You can reset in one click</li>
            </ul>
          </article>
          <article className="settings-help-card">
            <Info size={19} />
            <div><h3>Want cloud sync later?</h3><p>The codebase is ready to evolve: replace the local provider with authenticated storage and a secure server-side tutor route.</p></div>
          </article>
          <article className="settings-refresh-card">
            <RefreshCw size={17} />
            <span><strong>Changes save automatically</strong><small>Preferences and learning actions persist after refresh.</small></span>
          </article>
        </aside>
      </section>
    </div>
  );
}
