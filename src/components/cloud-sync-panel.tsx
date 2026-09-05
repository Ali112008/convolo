"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudCog,
  CloudDownload,
  CloudUpload,
  KeyRound,
  LoaderCircle,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  CloudSnapshotSizeError,
  CloudSyncConflictError,
  createDeviceId,
  readCloudSnapshot,
  writeCloudSnapshot,
  type CloudSnapshot,
} from "@/lib/cloud-sync";
import { firebaseIsConfigured, getFirebaseServices } from "@/lib/firebase-client";
import { shortDate } from "@/lib/learning-utils";
import { useLearning } from "./learning-provider";

const DEVICE_ID_KEY = "convolo.cloud-sync-device-id.v1";

type AccountMode = "sign-in" | "sign-up";
type SyncPhase = "signed-out" | "choosing" | "connected" | "conflict" | "error";

function summarizeSnapshot(snapshot: CloudSnapshot) {
  const completed = snapshot.data.conversations.filter((conversation) => conversation.completedAt).length;
  return {
    profileName: snapshot.data.profile?.name ?? "Unconfigured learner",
    targetLanguage: snapshot.data.profile?.targetLanguage ?? "No active language",
    words: snapshot.data.vocabulary.length,
    completed,
  };
}

function readableError(error: unknown): string {
  if (error instanceof CloudSnapshotSizeError) {
    return "This workspace is larger than the safe cloud snapshot limit. Export a local backup before reducing its size.";
  }
  if (error instanceof Error) {
    if (error.message.includes("auth/email-already-in-use")) return "An account already exists for that email.";
    if (error.message.includes("auth/invalid-credential")) return "That email or password was not recognized.";
    if (error.message.includes("auth/weak-password")) return "Use a stronger password with at least 8 characters.";
    if (error.message.includes("permission-denied")) return "Cloud access was denied. Check the Firebase security rules in the deployment guide.";
    if (error.message) return error.message;
  }
  return "Cloud sync could not complete. Your local workspace is unchanged.";
}

export function CloudSyncPanel() {
  const { data, restoreLearningData } = useLearning();
  const [mode, setMode] = useState<AccountMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<SyncPhase>("signed-out");
  const [remoteSnapshot, setRemoteSnapshot] = useState<CloudSnapshot | null>(null);
  const [revision, setRevision] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const deviceIdRef = useRef<string | null>(null);
  const inspectedUserIdRef = useRef<string | null>(null);

  const configured = firebaseIsConfigured();

  const inspectAccount = useCallback(async (nextUser: User) => {
    if (inspectedUserIdRef.current === nextUser.uid) return;
    inspectedUserIdRef.current = nextUser.uid;
    setBusy(true);
    setError("");
    setNotice("");
    setUser(nextUser);
    try {
      const snapshot = await readCloudSnapshot(nextUser.uid);
      setRemoteSnapshot(snapshot);
      setRevision(snapshot?.revision ?? 0);
      setPhase("choosing");
    } catch (caught) {
      inspectedUserIdRef.current = null;
      setError(readableError(caught));
      setPhase("error");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const services = getFirebaseServices();
    if (!services) return;

    const unsubscribe = onAuthStateChanged(services.auth, (nextUser) => {
      window.setTimeout(() => {
        if (nextUser) {
          void inspectAccount(nextUser);
        } else {
          inspectedUserIdRef.current = null;
          setUser(null);
          setPhase("signed-out");
          setRemoteSnapshot(null);
          setRevision(null);
        }
      }, 0);
    });
    return unsubscribe;
  }, [inspectAccount]);

  function getDeviceId(): string {
    if (deviceIdRef.current) return deviceIdRef.current;
    try {
      const stored = window.localStorage.getItem(DEVICE_ID_KEY);
      if (stored && stored.length < 128) {
        deviceIdRef.current = stored;
        return stored;
      }
      const generated = createDeviceId();
      window.localStorage.setItem(DEVICE_ID_KEY, generated);
      deviceIdRef.current = generated;
      return generated;
    } catch {
      // Private/locked-down browser storage should not prevent an explicitly
      // requested cloud write. The identifier simply remains session-local.
      const generated = createDeviceId();
      deviceIdRef.current = generated;
      return generated;
    }
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const services = getFirebaseServices();
    if (!services || busy) return;
    if (!email.trim() || password.length < 8) {
      setError("Enter an email and a password of at least 8 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const credential =
        mode === "sign-up"
          ? await createUserWithEmailAndPassword(services.auth, email.trim(), password)
          : await signInWithEmailAndPassword(services.auth, email.trim(), password);
      // onAuthStateChanged also runs, but doing this explicitly makes the
      // initial cloud/local decision visible immediately after the form closes.
      await inspectAccount(credential.user);
    } catch (caught) {
      setError(readableError(caught));
      setBusy(false);
    }
  }

  async function uploadLocalWorkspace(expectedRevision: number, successMessage: string) {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const nextRevision = await writeCloudSnapshot(
        user.uid,
        data,
        expectedRevision,
        getDeviceId()
      );
      setRevision(nextRevision);
      setRemoteSnapshot(null);
      setPhase("connected");
      setNotice(successMessage);
    } catch (caught) {
      if (caught instanceof CloudSyncConflictError) {
        await checkForCloudChanges("A newer cloud copy was found. Choose which workspace to keep.");
      } else {
        setError(readableError(caught));
      }
    } finally {
      setBusy(false);
    }
  }

  function restoreCloudWorkspace(snapshot: CloudSnapshot, successMessage: string) {
    if (!restoreLearningData(snapshot.data)) {
      setError("Convolo could not first save a local rollback copy, so the cloud workspace was not restored.");
      return;
    }
    setRevision(snapshot.revision);
    setRemoteSnapshot(null);
    setPhase("connected");
    setNotice(successMessage);
    setError("");
  }

  async function checkForCloudChanges(conflictMessage?: string) {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const snapshot = await readCloudSnapshot(user.uid);
      if (!snapshot) {
        setRevision(0);
        setRemoteSnapshot(null);
        setPhase("choosing");
        setNotice("No cloud workspace exists yet. You can upload this device when ready.");
        return;
      }
      if (snapshot.revision === revision) {
        setRemoteSnapshot(null);
        setPhase("connected");
        setNotice("Cloud copy is already current. Nothing was replaced.");
        return;
      }
      setRemoteSnapshot(snapshot);
      setRevision(snapshot.revision);
      setPhase("conflict");
      setNotice(conflictMessage ?? "Cloud copy loaded for review. Nothing was replaced.");
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    const services = getFirebaseServices();
    if (!services || busy) return;
    setBusy(true);
    try {
      await signOut(services.auth);
      setNotice("Signed out. This device keeps its local learning workspace.");
      setError("");
    } catch (caught) {
      setError(readableError(caught));
    } finally {
      setBusy(false);
    }
  }

  const remoteSummary = remoteSnapshot ? summarizeSnapshot(remoteSnapshot) : null;

  return (
    <article className="settings-card cloud-sync-card">
      <div className="settings-card-heading">
        <span className="settings-card-icon settings-card-icon-blue"><CloudCog size={20} /></span>
        <div>
          <h2>Optional cloud sync</h2>
          <p>Keep local-first learning by default, then sign in only if you want a private copy that can move between devices.</p>
        </div>
      </div>

      {!configured ? (
        <div className="cloud-setup-note">
          <ShieldCheck size={19} />
          <div>
            <strong>Cloud sync is ready to configure.</strong>
            <p>This deployment has no Firebase settings yet, so no account form is shown and all learning remains local. Add the four public Firebase environment values described in the README, enable Email/Password sign-in, and apply the included Firestore rules to turn on real cross-device sync.</p>
          </div>
        </div>
      ) : phase === "signed-out" ? (
        <div className="cloud-auth-layout">
          <div className="cloud-auth-copy">
            <span className="card-kicker">YOUR CHOICE</span>
            <h3>Sign in only when you want sync.</h3>
            <p>Convolo does not create an account automatically. After sign-in, you decide whether the local or cloud workspace wins before anything is replaced.</p>
            <ul>
              <li><CheckCircle2 size={15} /> Email and password are handled by Firebase Authentication</li>
              <li><CheckCircle2 size={15} /> A stale device cannot silently overwrite a newer cloud copy</li>
              <li><CheckCircle2 size={15} /> Signing out never deletes this device&apos;s local data</li>
            </ul>
          </div>
          <form className="cloud-auth-form" onSubmit={submitAccount}>
            <div className="cloud-mode-toggle" role="tablist" aria-label="Cloud account action">
              <button type="button" role="tab" aria-selected={mode === "sign-in"} className={mode === "sign-in" ? "cloud-mode-active" : ""} onClick={() => setMode("sign-in")}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === "sign-up"} className={mode === "sign-up" ? "cloud-mode-active" : ""} onClick={() => setMode("sign-up")}>Create account</button>
            </div>
            <label className="field-label" htmlFor="cloud-email">Email
              <span className="cloud-input-wrap"><Mail size={16} /><input className="text-input" id="cloud-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={160} required /></span>
            </label>
            <label className="field-label" htmlFor="cloud-password">Password
              <span className="cloud-input-wrap"><KeyRound size={16} /><input className="text-input" id="cloud-password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required /></span>
            </label>
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="button-spinner" size={17} /> : mode === "sign-in" ? <LogIn size={17} /> : <UserPlus size={17} />}
              {busy ? "Checking cloud workspace…" : mode === "sign-in" ? "Sign in securely" : "Create optional account"}
            </button>
          </form>
        </div>
      ) : (
        <div className="cloud-connected-state">
          <div className="cloud-user-row">
            <span className="cloud-user-icon"><Cloud size={19} /></span>
            <span><strong>{user?.email ?? "Connected account"}</strong><small>{phase === "connected" ? `Cloud revision ${revision ?? "—"}` : "Review required before syncing"}</small></span>
            <button className="text-button" type="button" onClick={disconnect} disabled={busy}><LogOut size={15} /> Sign out</button>
          </div>

          {phase === "error" && (
            <div className="cloud-conflict-card">
              <div><AlertTriangle size={20} /><span><strong>Signed in, but cloud storage could not be checked.</strong><small>Your local workspace was not changed. Check the Firebase configuration and security rules, then retry.</small></span></div>
              <div className="cloud-decision-actions">
                <button className="button button-secondary" type="button" onClick={() => user && void inspectAccount(user)} disabled={busy}><RefreshCw size={17} /> Retry cloud check</button>
              </div>
            </div>
          )}

          {phase === "choosing" && (
            <div className="cloud-decision-card">
              <div><CloudCog size={20} /><span><strong>{remoteSnapshot ? "A cloud workspace already exists" : "This account has no cloud workspace yet"}</strong><small>{remoteSnapshot ? "Choose deliberately—neither copy changes until you select an action." : "Upload this device to create your first encrypted-in-transit cloud copy."}</small></span></div>
              {remoteSnapshot && remoteSummary && <CloudSnapshotSummary summary={remoteSummary} snapshot={remoteSnapshot} />}
              <div className="cloud-decision-actions">
                {remoteSnapshot ? (
                  <button className="button button-secondary" type="button" onClick={() => restoreCloudWorkspace(remoteSnapshot, "Cloud workspace restored to this device. A local rollback is available in Backups.")} disabled={busy}><CloudDownload size={17} /> Use cloud on this device</button>
                ) : null}
                <button className="button button-primary" type="button" onClick={() => void uploadLocalWorkspace(revision ?? 0, remoteSnapshot ? "This device replaced the cloud copy after your confirmation." : "This device is now backed up to the cloud.")} disabled={busy}>
                  {busy ? <LoaderCircle className="button-spinner" size={17} /> : <CloudUpload size={17} />}
                  {remoteSnapshot ? "Replace cloud with this device" : "Upload this device"}
                </button>
              </div>
            </div>
          )}

          {phase === "connected" && (
            <div className="cloud-ready-card">
              <div><CheckCircle2 size={20} /><span><strong>Cloud sync is connected.</strong><small>Use Sync now after meaningful changes. Manual syncing is deliberate, so an imported backup or an old tab cannot silently replace another device&apos;s work.</small></span></div>
              <div className="cloud-ready-actions">
                <button className="button button-secondary" type="button" onClick={() => void checkForCloudChanges()} disabled={busy}><CloudDownload size={17} /> Check cloud copy</button>
                <button className="button button-primary" type="button" onClick={() => void uploadLocalWorkspace(revision ?? 0, "This device was synced to the cloud.")} disabled={busy}>
                  {busy ? <LoaderCircle className="button-spinner" size={17} /> : <CloudUpload size={17} />} Sync now
                </button>
              </div>
            </div>
          )}

          {phase === "conflict" && remoteSnapshot && remoteSummary && (
            <div className="cloud-conflict-card">
              <div><AlertTriangle size={20} /><span><strong>Cloud and device copies need a decision.</strong><small>A revision changed elsewhere. Convolo paused rather than overwriting either workspace.</small></span></div>
              <CloudSnapshotSummary summary={remoteSummary} snapshot={remoteSnapshot} />
              <div className="cloud-decision-actions">
                <button className="button button-secondary" type="button" onClick={() => restoreCloudWorkspace(remoteSnapshot, "Newer cloud workspace restored. A local rollback is available in Backups.")} disabled={busy}><CloudDownload size={17} /> Restore cloud here</button>
                <button className="button button-danger" type="button" onClick={() => void uploadLocalWorkspace(remoteSnapshot.revision, "Cloud copy replaced with this device after your confirmation.")} disabled={busy}><CloudUpload size={17} /> Replace cloud</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="cloud-sync-footnote"><RefreshCw size={15} /> Sync preserves the same V4 data validated by local backup restore. It does not change the active learning language or interface language.</div>
      {notice && <p className="portability-notice"><CheckCircle2 size={16} /> {notice}</p>}
      {error && <p className="portability-error" role="alert"><AlertTriangle size={16} /> {error}</p>}
    </article>
  );
}

function CloudSnapshotSummary({
  summary,
  snapshot,
}: {
  summary: ReturnType<typeof summarizeSnapshot>;
  snapshot: CloudSnapshot;
}) {
  return (
    <div className="cloud-snapshot-summary">
      <span><b>{summary.profileName}</b><small>learner</small></span>
      <span><b>{summary.targetLanguage}</b><small>active path</small></span>
      <span><b>{summary.words}</b><small>words</small></span>
      <span><b>{summary.completed}</b><small>completed scenes</small></span>
      <span><b>r{snapshot.revision}</b><small>{snapshot.updatedAt ? `updated ${shortDate(snapshot.updatedAt)}` : "cloud revision"}</small></span>
    </div>
  );
}
