import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = mkdtempSync(path.join(os.tmpdir(), "convolo-learning-data-"));
const tsc = process.platform === "win32" ? "tsc.cmd" : "tsc";
const localTsc = path.join(root, "node_modules", ".bin", tsc);

try {
  execFileSync(
    localTsc,
    [
      "--target",
      "ES2020",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--esModuleInterop",
      "--skipLibCheck",
      "--outDir",
      outputDirectory,
      "src/lib/types.ts",
      "src/lib/learning-data.ts",
    ],
    { cwd: root, stdio: "pipe" }
  );

  const require = createRequire(import.meta.url);
  const { createEmptyLearningData, normalizeLearningData } = require(
    path.join(outputDirectory, "learning-data.js")
  );

  const legacyProfile = {
    name: "Alex",
    email: "alex@example.test",
    nativeLanguage: "Arabic",
    targetLanguage: "spanish",
    level: "beginner",
    dailyGoal: 10,
    onboarded: true,
    joinedAt: "2026-09-05T10:00:00.000Z",
  };

  test("migrates V1 activity into the previously active language", () => {
    const legacyData = {
      version: 1,
      profile: legacyProfile,
      conversations: [],
      vocabulary: [],
      dailyActivity: {
        "2026-09-05": { xp: 24, minutes: 4, turns: 2 },
      },
      completedAchievementIds: ["first-turn"],
    };

    const migrated = normalizeLearningData(legacyData);
    assert.ok(migrated);
    assert.equal(migrated.version, 2);
    assert.deepEqual(migrated.languageActivity.spanish, legacyData.dailyActivity);
    assert.deepEqual(migrated.languageActivity.french, {});
  });

  test("preserves separate language ledgers in V2", () => {
    const data = createEmptyLearningData();
    data.profile = { ...legacyProfile, targetLanguage: "french" };
    data.dailyActivity = {
      "2026-09-05": { xp: 36, minutes: 6, turns: 3 },
    };
    data.languageActivity.french = {
      "2026-09-05": { xp: 12, minutes: 2, turns: 1 },
    };
    data.languageActivity.spanish = {
      "2026-09-04": { xp: 24, minutes: 4, turns: 2 },
    };

    const normalized = normalizeLearningData(data);
    assert.ok(normalized);
    assert.deepEqual(normalized.languageActivity.french, data.languageActivity.french);
    assert.deepEqual(normalized.languageActivity.spanish, data.languageActivity.spanish);
  });

  test("rejects unsupported schemas and sanitizes malformed local storage", () => {
    assert.equal(normalizeLearningData({ version: 99 }), null);

    const normalized = normalizeLearningData({
      version: 1,
      profile: legacyProfile,
      conversations: [],
      vocabulary: [
        { id: "unsafe", language: "not-a-language", term: "x", translation: "x" },
      ],
      dailyActivity: {
        notADate: { xp: 9, minutes: 9, turns: 9 },
        "2026-09-05": { xp: Infinity, minutes: -2, turns: 2.6 },
      },
      completedAchievementIds: ["first-turn", 7, null],
    });

    assert.ok(normalized);
    assert.deepEqual(normalized.vocabulary, []);
    assert.deepEqual(normalized.dailyActivity, {
      "2026-09-05": { xp: 0, minutes: 0, turns: 3 },
    });
    assert.deepEqual(normalized.completedAchievementIds, ["first-turn"]);
  });
} finally {
  process.on("exit", () => rmSync(outputDirectory, { recursive: true, force: true }));
}
