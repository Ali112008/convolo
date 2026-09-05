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
      "src/lib/review-scheduling.ts",
      "src/lib/catalog.ts",
      "src/lib/placement.ts",
    ],
    { cwd: root, stdio: "pipe" }
  );

  const require = createRequire(import.meta.url);
  const { createEmptyLearningData, normalizeLearningData } = require(
    path.join(outputDirectory, "learning-data.js")
  );
  const { scheduleVocabularyReview, sortReviewQueue } = require(
    path.join(outputDirectory, "review-scheduling.js")
  );
  const { createTutorTurn } = require(path.join(outputDirectory, "catalog.js"));
  const {
    getAdaptiveRecommendation,
    recommendLevelFromPlacement,
  } = require(path.join(outputDirectory, "placement.js"));

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

  test("migrates V1 activity and path preferences into the prior target language", () => {
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
    assert.equal(migrated.version, 4);
    assert.deepEqual(migrated.languageActivity.spanish, legacyData.dailyActivity);
    assert.deepEqual(migrated.languageActivity.french, {});
    assert.deepEqual(migrated.languagePreferences.spanish, {
      level: "beginner",
      dailyGoal: 10,
    });
  });

  test("migrates V2 ledgers while retaining each language's historical activity", () => {
    const v2Data = {
      version: 2,
      profile: { ...legacyProfile, targetLanguage: "french", level: "intermediate", dailyGoal: 15 },
      conversations: [],
      vocabulary: [],
      dailyActivity: {
        "2026-09-05": { xp: 36, minutes: 6, turns: 3 },
      },
      languageActivity: {
        spanish: { "2026-09-04": { xp: 24, minutes: 4, turns: 2 } },
        french: { "2026-09-05": { xp: 12, minutes: 2, turns: 1 } },
        german: {},
        japanese: {},
      },
      completedAchievementIds: [],
    };

    const migrated = normalizeLearningData(v2Data);
    assert.ok(migrated);
    assert.equal(migrated.version, 4);
    assert.deepEqual(migrated.languageActivity.french, v2Data.languageActivity.french);
    assert.deepEqual(migrated.languageActivity.spanish, v2Data.languageActivity.spanish);
    assert.deepEqual(migrated.languagePreferences.french, {
      level: "intermediate",
      dailyGoal: 15,
    });
  });

  test("preserves separate V3 language preferences and synchronizes the active profile", () => {
    const data = createEmptyLearningData();
    data.profile = { ...legacyProfile, targetLanguage: "french", level: "starter", dailyGoal: 5 };
    data.version = 3;
    delete data.workspacePreferences;
    data.languagePreferences.french = { level: "advanced", dailyGoal: 20 };
    data.languagePreferences.spanish = { level: "beginner", dailyGoal: 10 };

    const normalized = normalizeLearningData(data);
    assert.ok(normalized);
    assert.deepEqual(normalized.languagePreferences.french, {
      level: "advanced",
      dailyGoal: 20,
    });
    assert.equal(normalized.profile.level, "advanced");
    assert.equal(normalized.profile.dailyGoal, 20);
  });

  test("preserves V4 review, placement, and interface preferences", () => {
    const data = createEmptyLearningData();
    data.profile = legacyProfile;
    data.workspacePreferences = {
      interfaceLanguage: "en",
      textScale: "large",
      highContrast: true,
      reduceMotion: true,
      reminders: { enabled: true, preferredTime: "18:30" },
    };
    data.languagePreferences.spanish = {
      level: "beginner",
      dailyGoal: 10,
      placement: {
        score: 4,
        totalQuestions: 6,
        recommendedLevel: "intermediate",
        completedAt: "2026-09-05T12:00:00.000Z",
      },
    };
    data.vocabulary = [
      {
        id: "review-state",
        language: "spanish",
        term: "hola",
        translation: "hello",
        example: "Hola.",
        source: "manual",
        createdAt: "2026-09-05T10:00:00.000Z",
        nextReviewAt: "2026-09-08T09:00:00.000Z",
        correctCount: 2,
        reviewIntervalDays: 3,
        easeFactor: 2.45,
        reviewCount: 3,
        lapseCount: 1,
      },
    ];

    const normalized = normalizeLearningData(data);
    assert.ok(normalized);
    assert.equal(normalized.version, 4);
    assert.equal(normalized.workspacePreferences.textScale, "large");
    assert.equal(normalized.workspacePreferences.reminders.preferredTime, "18:30");
    assert.deepEqual(normalized.languagePreferences.spanish.placement, {
      score: 4,
      totalQuestions: 6,
      recommendedLevel: "intermediate",
      completedAt: "2026-09-05T12:00:00.000Z",
    });
    assert.deepEqual(normalized.vocabulary[0], data.vocabulary[0]);
  });

  test("uses adaptive intervals and prioritizes fragile overdue words", () => {
    const word = {
      id: "review-word",
      language: "spanish",
      term: "gracias",
      translation: "thank you",
      example: "Gracias.",
      source: "manual",
      createdAt: "2026-09-05T10:00:00.000Z",
      nextReviewAt: "2026-09-05T10:00:00.000Z",
      correctCount: 0,
      reviewIntervalDays: 0,
      easeFactor: 2.3,
      reviewCount: 0,
      lapseCount: 0,
    };
    const reviewedAt = new Date("2026-09-05T12:00:00.000Z");
    const again = scheduleVocabularyReview(word, "again", reviewedAt);
    const good = scheduleVocabularyReview(word, "good", reviewedAt);
    const easy = scheduleVocabularyReview(word, "easy", reviewedAt);

    assert.equal(again.lapseCount, 1);
    assert.equal(again.reviewIntervalDays, 0);
    assert.equal(again.nextReviewAt, "2026-09-05T12:10:00.000Z");
    assert.equal(good.reviewIntervalDays, 1);
    assert.equal(easy.reviewIntervalDays, 4);

    const queue = sortReviewQueue(
      [
        { ...word, id: "stable", reviewIntervalDays: 7, lapseCount: 0 },
        { ...word, id: "fragile", reviewIntervalDays: 1, lapseCount: 2 },
      ],
      reviewedAt.getTime()
    );
    assert.equal(queue[0].id, "fragile");
  });

  test("creates a diagnostic-led adaptive next step without changing the selected level", () => {
    assert.equal(recommendLevelFromPlacement(1, 6), "starter");
    assert.equal(recommendLevelFromPlacement(3, 6), "beginner");
    assert.equal(recommendLevelFromPlacement(4, 6), "intermediate");
    assert.equal(recommendLevelFromPlacement(6, 6), "advanced");

    const data = createEmptyLearningData();
    data.profile = legacyProfile;
    const beforePlacement = getAdaptiveRecommendation(
      data,
      "spanish",
      new Date("2026-09-05T12:00:00.000Z").getTime()
    );
    assert.equal(beforePlacement.href, "/app/plan");

    data.languagePreferences.spanish = {
      level: "beginner",
      dailyGoal: 10,
      placement: {
        score: 4,
        totalQuestions: 6,
        recommendedLevel: "intermediate",
        completedAt: "2026-09-05T12:00:00.000Z",
      },
    };
    data.vocabulary = [
      {
        id: "due-first",
        language: "spanish",
        term: "hola",
        translation: "hello",
        example: "Hola.",
        source: "manual",
        createdAt: "2026-09-05T09:00:00.000Z",
        nextReviewAt: "2026-09-05T10:00:00.000Z",
        correctCount: 0,
        reviewIntervalDays: 0,
        easeFactor: 2.3,
        reviewCount: 0,
        lapseCount: 1,
      },
    ];
    const dueRecommendation = getAdaptiveRecommendation(
      data,
      "spanish",
      new Date("2026-09-05T12:00:00.000Z").getTime()
    );
    assert.equal(dueRecommendation.href, "/app/vocabulary");
    assert.equal(data.languagePreferences.spanish.level, "beginner");

    const starterTutor = createTutorTurn("spanish", "cafe", "hola", 0, "starter");
    const advancedTutor = createTutorTurn("spanish", "cafe", "hola", 0, "advanced");
    assert.match(starterTutor.correction.explanation, /one clear phrase/i);
    assert.match(advancedTutor.correction.explanation, /personal follow-up/i);
  });

  test("uses visible profile settings if V3 active-path preferences are missing or malformed", () => {
    const malformed = createEmptyLearningData();
    malformed.profile = {
      ...legacyProfile,
      targetLanguage: "japanese",
      level: "advanced",
      dailyGoal: 20,
    };
    malformed.version = 3;
    delete malformed.workspacePreferences;
    malformed.languagePreferences.japanese = { level: "advanced", dailyGoal: 999 };

    const normalizedMalformed = normalizeLearningData(malformed);
    assert.ok(normalizedMalformed);
    assert.deepEqual(normalizedMalformed.languagePreferences.japanese, {
      level: "advanced",
      dailyGoal: 20,
    });
    assert.equal(normalizedMalformed.profile.level, "advanced");
    assert.equal(normalizedMalformed.profile.dailyGoal, 20);

    const missing = createEmptyLearningData();
    missing.profile = {
      ...legacyProfile,
      targetLanguage: "french",
      level: "intermediate",
      dailyGoal: 15,
    };
    missing.version = 3;
    delete missing.workspacePreferences;
    delete missing.languagePreferences.french;

    const normalizedMissing = normalizeLearningData(missing);
    assert.ok(normalizedMissing);
    assert.deepEqual(normalizedMissing.languagePreferences.french, {
      level: "intermediate",
      dailyGoal: 15,
    });
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
