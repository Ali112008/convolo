"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  History,
  ShieldCheck,
  Undo2,
  Upload,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { normalizeLearningData } from "@/lib/learning-data";
import type { LearningData } from "@/lib/types";
import { useLearning } from "./learning-provider";

const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

function dataSummary(data: LearningData) {
  const completedConversations = data.conversations.filter(
    (conversation) => conversation.completedAt).length;
  const drafts = data.conversations.length - completedConversations;
  return {
    profileName: data.profile?.name ?? "Unconfigured learner",
    targetLanguage: data.profile?.targetLanguage ?? "No active language",
    words: data.vocabulary.length,
    conversations: data.conversations.length,
    completedConversations,
    drafts,
  };
}

export function DataPortabilityPanel() {
  const { data, restoreLearningData, undoLastRestore } = useLearning();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [candidate, setCandidate] = useState<LearningData | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [confirmingUndo, setConfirmingUndo] = useState(false);

  function exportData() {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `convolo-learning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("Backup downloaded. Keep it somewhere private.");
    setError("");
  }

  async function inspectBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setCandidate(null);
    setConfirmingRestore(false);
    setNotice("");

    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setError("This backup is larger than 5 MB, so it was not opened in the browser.");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(await file.text());
      const normalized = normalizeLearningData(parsed);
      if (!normalized) {
        setError("This file is not a recognized Convolo backup.");
        return;
      }
      setCandidate(normalized);
      setCandidateName(file.name);
      setError("");
    } catch {
      setError("The selected file could not be read as a valid JSON backup.");
    }
  }

  function restoreCandidate() {
    if (!candidate) return;
    const restored = restoreLearningData(candidate);
    if (!restored) {
      setError("Convolo could not first save a local rollback copy, so nothing was replaced.");
      setConfirmingRestore(false);
      return;
    }
    setNotice("Backup restored locally. One rollback copy is available until you undo or reset data.");
    setCandidate(null);
    setCandidateName("");
    setConfirmingRestore(false);
    setError("");
  }

  function undoRestore() {
    if (undoLastRestore()) {
      setNotice("The workspace from before the last restore is back on this device.");
      setError("");
      setConfirmingUndo(false);
      return;
    }
    setError("There is no safe restore rollback available on this device.");
    setConfirmingUndo(false);
  }

  const summary = candidate ? dataSummary(candidate) : null;

  return (
    <article className="settings-card portability-card">
      <div className="settings-card-heading">
        <span className="settings-card-icon settings-card-icon-blue"><History size={20} /></span>
        <div>
          <h2>Backups and restore</h2>
          <p>Export a private JSON copy or inspect a backup before it can replace this browser&apos;s workspace.</p>
        </div>
      </div>

      <div className="portability-actions">
        <div className="portability-action-copy">
          <h3>Export a backup</h3>
          <p>Includes all language paths, placement results, review schedules, and workspace preferences.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={exportData}>
          <Download size={17} /> Export JSON
        </button>
      </div>

      <div className="portability-actions portability-import-row">
        <div className="portability-action-copy">
          <h3>Restore from a backup</h3>
          <p>Convolo validates the file first. Restore replaces local data only after your confirmation; it never silently merges activity totals.</p>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          id="backup-file-input"
          type="file"
          accept="application/json,.json"
          onChange={inspectBackup}
        />
        <button className="button button-secondary" type="button" onClick={() => inputRef.current?.click()}>
          <FileUp size={17} /> Choose backup
        </button>
      </div>

      {candidate && summary && (
        <div className="backup-preview" role="status">
          <div className="backup-preview-heading">
            <ShieldCheck size={19} />
            <div><strong>Backup inspected safely</strong><small>{candidateName} · normalized to schema V{candidate.version}</small></div>
          </div>
          <div className="backup-preview-stats">
            <span><b>{summary.profileName}</b><small>learner</small></span>
            <span><b>{summary.targetLanguage}</b><small>active path</small></span>
            <span><b>{summary.words}</b><small>words</small></span>
            <span><b>{summary.conversations}</b><small>conversations</small></span>
          </div>
          {!confirmingRestore ? (
            <div className="backup-preview-actions">
              <small>{summary.completedConversations} completed scene{summary.completedConversations === 1 ? "" : "s"} and {summary.drafts} saved draft{summary.drafts === 1 ? "" : "s"} will replace the local workspace.</small>
              <div>
                <button className="button button-ghost" type="button" onClick={() => setCandidate(null)}>Cancel</button>
                <button className="button button-primary" type="button" onClick={() => setConfirmingRestore(true)}>
                  Review replacement <Upload size={17} />
                </button>
              </div>
            </div>
          ) : (
            <div className="backup-restore-confirmation">
              <div><AlertTriangle size={19} /><span><strong>Replace this browser&apos;s workspace?</strong><small>Your current data is first saved as a one-time rollback. Cloud data is not changed until you manually sync it.</small></span></div>
              <div><button className="button button-ghost" type="button" onClick={() => setConfirmingRestore(false)}>Keep current data</button><button className="button button-danger" type="button" onClick={restoreCandidate}>Yes, restore this backup</button></div>
            </div>
          )}
        </div>
      )}

      <div className="portability-undo-row">
        <span><Undo2 size={16} /> Restored the wrong file? You can undo the latest restore once.</span>
        <button className="text-button" type="button" onClick={() => setConfirmingUndo(true)}>Undo restore</button>
      </div>
      {confirmingUndo && (
        <div className="backup-restore-confirmation backup-undo-confirmation">
          <div><AlertTriangle size={19} /><span><strong>Undo the last restore?</strong><small>This replaces the current local workspace with the snapshot from before that restore. Any newer local changes will be replaced.</small></span></div>
          <div><button className="button button-ghost" type="button" onClick={() => setConfirmingUndo(false)}>Keep current workspace</button><button className="button button-danger" type="button" onClick={undoRestore}>Yes, undo restore</button></div>
        </div>
      )}
      {notice && <p className="portability-notice"><CheckCircle2 size={16} /> {notice}</p>}
      {error && <p className="portability-error" role="alert"><AlertTriangle size={16} /> {error}</p>}
    </article>
  );
}
