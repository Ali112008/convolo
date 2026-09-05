"use client";

import {
  Accessibility,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Contrast,
  Languages,
  MonitorCog,
  Send,
  Smartphone,
  Type,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { INTERFACE_LOCALES, uiCopy } from "@/lib/i18n";
import { useLearning } from "./learning-provider";

type ReminderServiceWorkerRegistration = ServiceWorkerRegistration & {
  periodicSync?: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>;
  };
};

async function registerReminderWorker() {
  if (!("serviceWorker" in navigator)) return null;
  const registration = (await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  })) as ReminderServiceWorkerRegistration;
  await navigator.serviceWorker.ready;
  return registration;
}

export function WorkspacePreferencesPanel() {
  const { data, updateWorkspacePreferences } = useLearning();
  const preferences = data.workspacePreferences;
  const activeInterfaceLocale = INTERFACE_LOCALES.find(
    (locale) => locale.id === preferences.interfaceLanguage
  ) ?? INTERFACE_LOCALES[0];
  const reminderTimeRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);

  function updateAccessibility(
    updates: Parameters<typeof updateWorkspacePreferences>[0]
  ) {
    updateWorkspacePreferences(updates);
    setNotice("Accessibility preference saved on this device.");
    setError("");
  }

  async function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingReminder) return;
    const form = new FormData(event.currentTarget);
    const enabled = form.get("reminders-enabled") === "on";
    const preferredTime = reminderTimeRef.current?.value ?? preferences.reminders.preferredTime;

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)) {
      setError("Choose a valid reminder time.");
      return;
    }

    setSavingReminder(true);
    setError("");
    let preferenceSaved = false;
    try {
      if (enabled) {
        if (!("Notification" in window)) {
          setError("This browser does not support notifications. Your in-app review queue still works.");
          return;
        }
        const permission =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;
        if (permission !== "granted") {
          setError("Notification permission was not granted. No reminder was enabled.");
          return;
        }
      }

      updateWorkspacePreferences({ reminders: { enabled, preferredTime } });
      preferenceSaved = true;
      const registration = await registerReminderWorker();
      if (!registration?.active) throw new Error("No active notification worker");
      registration.active.postMessage({
        type: "CONVOLO_REMINDER_PREFERENCE",
        preference: { enabled, preferredTime },
      });
      if (enabled && registration.periodicSync) {
        await registration.periodicSync
          .register("convolo-review-reminder", { minInterval: 24 * 60 * 60 * 1_000 })
          .catch(() => undefined);
      }
      setNotice(
        enabled
          ? "Reminder saved. Installed PWAs may show a best-effort background reminder when the browser supports it."
          : "Review reminder turned off for this device."
      );
    } catch {
      setError(
        preferenceSaved
          ? "The reminder preference was saved, but this browser could not activate its notification worker. Your in-app due queue still works."
          : "The reminder preference was not saved. Your study data is unchanged."
      );
    } finally {
      setSavingReminder(false);
    }
  }

  async function sendTestReminder() {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      setError("Allow notifications first, then save the reminder preference.");
      return;
    }
    try {
      const registration = await registerReminderWorker();
      if (!registration?.active) throw new Error("No active notification worker");
      registration.active.postMessage({ type: "CONVOLO_TEST_REMINDER" });
      setNotice("A test reminder was requested for this device.");
      setError("");
    } catch {
      setError("A test notification could not be sent on this browser.");
    }
  }

  return (
    <article className="settings-card workspace-preferences-card">
      <div className="settings-card-heading">
        <span className="settings-card-icon settings-card-icon-blue"><Accessibility size={20} /></span>
        <div>
          <h2>Interface, access, and reminders</h2>
          <p>These device preferences are independent from the language you are studying.</p>
        </div>
      </div>

      <div className="interface-foundation-note">
        <Languages size={18} />
        <div><strong>{activeInterfaceLocale.label} interface · {uiCopy(preferences.interfaceLanguage, "translationFoundation")}</strong><p>Interface copy and document direction are kept separately from Spanish, French, German, and Japanese learning paths. {uiCopy(preferences.interfaceLanguage, "studyLanguageSeparate")} This release keeps the established English interface while making future locale packs safe to add.</p></div>
      </div>

      <div className="accessibility-preferences-grid">
        <label className="accessibility-choice" htmlFor="text-scale-select">
          <span className="accessibility-choice-icon"><Type size={18} /></span>
          <span><strong>Reading size</strong><small>Increase interface text without affecting lesson content.</small></span>
          <select id="text-scale-select" className="select-input" value={preferences.textScale} onChange={(event) => updateAccessibility({ textScale: event.target.value === "large" ? "large" : "default" })}>
            <option value="default">Default</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="accessibility-choice accessibility-toggle-choice" htmlFor="high-contrast-toggle">
          <span className="accessibility-choice-icon"><Contrast size={18} /></span>
          <span><strong>High contrast</strong><small>Use stronger boundaries and text contrast.</small></span>
          <input id="high-contrast-toggle" type="checkbox" checked={preferences.highContrast} onChange={(event) => updateAccessibility({ highContrast: event.target.checked })} />
        </label>
        <label className="accessibility-choice accessibility-toggle-choice" htmlFor="reduced-motion-toggle">
          <span className="accessibility-choice-icon"><MonitorCog size={18} /></span>
          <span><strong>Reduce motion</strong><small>Minimize nonessential movement and transitions.</small></span>
          <input id="reduced-motion-toggle" type="checkbox" checked={preferences.reduceMotion} onChange={(event) => updateAccessibility({ reduceMotion: event.target.checked })} />
        </label>
      </div>

      <form className="reminder-preferences" onSubmit={saveReminder}>
        <div className="reminder-heading">
          <span className="settings-card-icon settings-card-icon-purple"><Bell size={19} /></span>
          <div><h3>Optional review reminder</h3><p>Install Convolo as a PWA for the best chance of an on-device background reminder. Browser support and timing are best-effort, so your due queue remains the reliable source of truth.</p></div>
        </div>
        <div className="reminder-controls">
          <label className="field-label" htmlFor="reminder-time">Preferred time
            <input ref={reminderTimeRef} className="text-input" id="reminder-time" name="reminder-time" type="time" defaultValue={preferences.reminders.preferredTime} required />
          </label>
          <label className="reminder-enabled-toggle" htmlFor="reminders-enabled">
            <input id="reminders-enabled" name="reminders-enabled" type="checkbox" defaultChecked={preferences.reminders.enabled} />
            <span><b>Enable on this device</b><small>Permission is requested only after you save.</small></span>
          </label>
          <button className="button button-primary" type="submit" disabled={savingReminder}>
            <Bell size={17} /> {savingReminder ? "Saving reminder…" : "Save reminder"}
          </button>
        </div>
        <div className="reminder-help-row">
          <span><Smartphone size={16} /> To install: use your browser&apos;s “Install app” or “Add to Home Screen” action.</span>
          <button className="text-button" type="button" onClick={() => void sendTestReminder()}><Send size={15} /> Send test</button>
        </div>
      </form>
      {notice && <p className="portability-notice"><CheckCircle2 size={16} /> {notice}</p>}
      {error && <p className="portability-error" role="alert"><AlertTriangle size={16} /> {error}</p>}
    </article>
  );
}
