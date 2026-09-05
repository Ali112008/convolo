import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirebaseServices } from "./firebase-client";
import { normalizeLearningData } from "./learning-data";
import type { LearningData } from "./types";

const CLOUD_COLLECTION = "convoloLearningWorkspaces";
const MAX_CLOUD_SNAPSHOT_BYTES = 800_000;

export interface CloudSnapshot {
  data: LearningData;
  revision: number;
  byteLength: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export class CloudSyncConflictError extends Error {
  constructor() {
    super("The cloud copy changed on another device.");
    this.name = "CloudSyncConflictError";
  }
}

export class CloudSnapshotSizeError extends Error {
  constructor() {
    super("This workspace is too large for one cloud snapshot.");
    this.name = "CloudSnapshotSizeError";
  }
}

function getWorkspaceReference(userId: string) {
  const services = getFirebaseServices();
  if (!services) throw new Error("Firebase cloud sync is not configured.");
  return { db: services.db, ref: doc(services.db, CLOUD_COLLECTION, userId) };
}

function serializeLearningData(data: LearningData): { payload: LearningData; byteLength: number } {
  // JSON round-tripping removes undefined optional properties that Firestore
  // intentionally refuses to store, without changing the backup shape.
  const serialized = JSON.stringify(data);
  const byteLength = new TextEncoder().encode(serialized).byteLength;
  if (byteLength > MAX_CLOUD_SNAPSHOT_BYTES) {
    throw new CloudSnapshotSizeError();
  }
  return { payload: JSON.parse(serialized) as LearningData, byteLength };
}

function normalizedRevision(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 1
    ? value
    : null;
}

function timestampToIso(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }
  return null;
}

/** Reads a fully validated snapshot. Corrupt cloud payloads are never applied. */
export async function readCloudSnapshot(userId: string): Promise<CloudSnapshot | null> {
  const { ref } = getWorkspaceReference(userId);
  const response = await getDoc(ref);
  if (!response.exists()) return null;

  const raw = response.data();
  const data = normalizeLearningData(raw.payload);
  const revision = normalizedRevision(raw.revision);
  if (!data || !revision) {
    throw new Error("The cloud copy is incomplete and was not loaded.");
  }

  return {
    data,
    revision,
    byteLength: typeof raw.byteLength === "number" ? raw.byteLength : 0,
    updatedAt: timestampToIso(raw.updatedAt),
    updatedBy: typeof raw.updatedBy === "string" ? raw.updatedBy : null,
  };
}

/**
 * Uses an optimistic revision transaction. A stale device can never overwrite
 * another device's newer snapshot without a deliberate user decision.
 */
export async function writeCloudSnapshot(
  userId: string,
  data: LearningData,
  expectedRevision: number,
  deviceId: string
): Promise<number> {
  const { db, ref } = getWorkspaceReference(userId);
  const { payload, byteLength } = serializeLearningData(data);

  return runTransaction(db, async (transaction) => {
    const remote = await transaction.get(ref);
    const actualRevision = remote.exists() ? normalizedRevision(remote.data().revision) : 0;
    if (actualRevision === null) {
      throw new Error("The existing cloud revision is invalid and was not replaced.");
    }
    if (actualRevision !== expectedRevision) {
      throw new CloudSyncConflictError();
    }

    const revision = actualRevision + 1;
    transaction.set(ref, {
      payload,
      revision,
      byteLength,
      updatedAt: serverTimestamp(),
      updatedBy: deviceId,
    });
    return revision;
  });
}

export function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `device-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
