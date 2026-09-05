import type {
  Conversation,
  ConversationMessage,
  DailyActivity,
  LanguageActivity,
  LanguageLearningPreferences,
  LanguagePreferences,
  LearningData,
  LearningLevel,
  LearningProfile,
  ScenarioId,
  TargetLanguage,
  VocabularyWord,
} from "./types";

export const TARGET_LANGUAGE_IDS: readonly TargetLanguage[] = [
  "spanish",
  "french",
  "german",
  "japanese",
];

const LEARNING_LEVEL_IDS: readonly LearningLevel[] = [
  "starter",
  "beginner",
  "intermediate",
  "advanced",
];

const SCENARIO_IDS: readonly ScenarioId[] = [
  "cafe",
  "introductions",
  "directions",
  "hotel",
];

const EMPTY_DATE = "1970-01-01T00:00:00.000Z";
const MAX_ACTIVITY_DAYS = 3_660;
const DEFAULT_LANGUAGE_PREFERENCES: LanguageLearningPreferences = {
  level: "starter",
  dailyGoal: 10,
};

export function isTargetLanguage(value: unknown): value is TargetLanguage {
  return (
    typeof value === "string" &&
    TARGET_LANGUAGE_IDS.some((language) => language === value)
  );
}

function isLearningLevel(value: unknown): value is LearningLevel {
  return (
    typeof value === "string" &&
    LEARNING_LEVEL_IDS.some((level) => level === value)
  );
}

function isScenarioId(value: unknown): value is ScenarioId {
  return (
    typeof value === "string" &&
    SCENARIO_IDS.some((scenario) => scenario === value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, maxLength: number, fallback = ""): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function timestamp(value: unknown): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return EMPTY_DATE;
  }
  return value;
}

function boundedNumber(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isValidDailyGoal(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 180
  );
}

function normalizeDailyGoal(value: unknown): number {
  return boundedNumber(
    typeof value === "number" && Number.isFinite(value) ? value : 10,
    1,
    180
  );
}

function normalizeProfile(value: unknown): LearningProfile | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || !isTargetLanguage(value.targetLanguage)) return null;

  return {
    name: text(value.name, 40, "Learner") || "Learner",
    email: text(value.email, 160),
    nativeLanguage: text(value.nativeLanguage, 60, "Arabic") || "Arabic",
    targetLanguage: value.targetLanguage,
    level: isLearningLevel(value.level) ? value.level : "starter",
    dailyGoal: normalizeDailyGoal(value.dailyGoal),
    onboarded: value.onboarded === true,
    joinedAt: timestamp(value.joinedAt),
  };
}

function normalizeMessage(value: unknown): ConversationMessage | null {
  if (!isRecord(value)) return null;
  const role = value.role === "tutor" || value.role === "learner" ? value.role : null;
  const id = text(value.id, 100);
  const messageText = text(value.text, 1_500);
  if (!role || !id || !messageText) return null;

  const translation = text(value.translation, 1_500);
  return {
    id,
    role,
    text: messageText,
    ...(translation ? { translation } : {}),
    createdAt: timestamp(value.createdAt),
  };
}

function normalizeConversation(value: unknown): Conversation | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 100);
  if (!id || !isScenarioId(value.scenarioId) || !isTargetLanguage(value.language)) {
    return null;
  }

  const messages = Array.isArray(value.messages)
    ? value.messages
        .map(normalizeMessage)
        .filter((message): message is ConversationMessage => message !== null)
        .slice(-100)
    : [];
  const completedAt = value.completedAt ? timestamp(value.completedAt) : undefined;

  return {
    id,
    scenarioId: value.scenarioId,
    scenarioTitle: text(value.scenarioTitle, 100, "Practice scenario") || "Practice scenario",
    language: value.language,
    startedAt: timestamp(value.startedAt),
    ...(completedAt ? { completedAt } : {}),
    messages,
    xpEarned: boundedNumber(value.xpEarned, 0, 1_000_000),
  };
}

function normalizeVocabularyWord(value: unknown): VocabularyWord | null {
  if (!isRecord(value)) return null;
  const id = text(value.id, 100);
  const term = text(value.term, 120);
  const translation = text(value.translation, 180);
  if (!id || !term || !translation || !isTargetLanguage(value.language)) return null;

  const source =
    value.source === "starter" || value.source === "practice" || value.source === "manual"
      ? value.source
      : "manual";
  const example = text(value.example, 300, term) || term;
  const notes = text(value.notes, 500);
  const lastReviewedAt = value.lastReviewedAt
    ? timestamp(value.lastReviewedAt)
    : undefined;

  return {
    id,
    language: value.language,
    term,
    translation,
    example,
    ...(notes ? { notes } : {}),
    source,
    createdAt: timestamp(value.createdAt),
    ...(lastReviewedAt ? { lastReviewedAt } : {}),
    nextReviewAt: timestamp(value.nextReviewAt),
    correctCount: boundedNumber(value.correctCount, 0, 10_000),
  };
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function normalizeDailyActivity(value: unknown): Record<string, DailyActivity> {
  if (!isRecord(value)) return {};

  const result: Record<string, DailyActivity> = {};
  const validEntries = Object.entries(value)
    .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .slice(-MAX_ACTIVITY_DAYS);

  validEntries.forEach(([key, activity]) => {
    if (!isRecord(activity)) return;
    result[key] = {
      xp: boundedNumber(activity.xp, 0, 10_000_000),
      minutes: boundedNumber(activity.minutes, 0, 100_000),
      turns: boundedNumber(activity.turns, 0, 1_000_000),
    };
  });

  return result;
}

export function createLanguageActivity(): LanguageActivity {
  return {
    spanish: {},
    french: {},
    german: {},
    japanese: {},
  };
}

export function createLanguagePreferences(): LanguagePreferences {
  return {
    spanish: { ...DEFAULT_LANGUAGE_PREFERENCES },
    french: { ...DEFAULT_LANGUAGE_PREFERENCES },
    german: { ...DEFAULT_LANGUAGE_PREFERENCES },
    japanese: { ...DEFAULT_LANGUAGE_PREFERENCES },
  };
}

function normalizeLanguageActivity(value: unknown): LanguageActivity {
  const normalized = createLanguageActivity();
  if (!isRecord(value)) return normalized;

  TARGET_LANGUAGE_IDS.forEach((language) => {
    normalized[language] = normalizeDailyActivity(value[language]);
  });
  return normalized;
}

function normalizeLanguagePreferences(value: unknown): LanguagePreferences {
  const normalized = createLanguagePreferences();
  if (!isRecord(value)) return normalized;

  TARGET_LANGUAGE_IDS.forEach((language) => {
    const preferences = value[language];
    if (!isRecord(preferences)) return;
    normalized[language] = {
      level: isLearningLevel(preferences.level)
        ? preferences.level
        : DEFAULT_LANGUAGE_PREFERENCES.level,
      dailyGoal: normalizeDailyGoal(preferences.dailyGoal),
    };
  });
  return normalized;
}

function hasActivity(activity: Record<string, DailyActivity>): boolean {
  return Object.values(activity).some(
    (item) => item.xp > 0 || item.minutes > 0 || item.turns > 0
  );
}

function normalizedAchievements(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string"))]
    .map((item) => item.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 100);
}

export function createEmptyLearningData(): LearningData {
  return {
    version: 3,
    profile: null,
    conversations: [],
    vocabulary: [],
    dailyActivity: {},
    languageActivity: createLanguageActivity(),
    languagePreferences: createLanguagePreferences(),
    completedAchievementIds: [],
  };
}

/**
 * Accepts V1/V2 browser formats and upgrades them without discarding a
 * learner's records. Old activity and preferences are assigned to the target
 * language that was active when they were saved. Invalid/tampered localStorage
 * values are reduced to safe values instead of being allowed to break the UI.
 */
export function normalizeLearningData(value: unknown): LearningData | null {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2 && value.version !== 3)) {
    return null;
  }

  let profile = normalizeProfile(value.profile);
  const conversations = Array.isArray(value.conversations)
    ? deduplicateById(
        value.conversations
          .map(normalizeConversation)
          .filter((item): item is Conversation => item !== null)
          .slice(0, 500)
      )
    : [];
  const vocabulary = Array.isArray(value.vocabulary)
    ? deduplicateById(
        value.vocabulary
          .map(normalizeVocabularyWord)
          .filter((item): item is VocabularyWord => item !== null)
          .slice(0, 2_000)
      )
    : [];
  const dailyActivity = normalizeDailyActivity(value.dailyActivity);
  const languageActivity =
    value.version === 1
      ? createLanguageActivity()
      : normalizeLanguageActivity(value.languageActivity);
  const languagePreferences =
    value.version === 3
      ? normalizeLanguagePreferences(value.languagePreferences)
      : createLanguagePreferences();

  if (profile && !hasActivity(languageActivity[profile.targetLanguage]) && hasActivity(dailyActivity)) {
    const noLanguageLedgerExists = TARGET_LANGUAGE_IDS.every(
      (language) => !hasActivity(languageActivity[language])
    );
    if (value.version === 1 || noLanguageLedgerExists) {
      languageActivity[profile.targetLanguage] = { ...dailyActivity };
    }
  }

  if (profile) {
    const rawLanguagePreferences = isRecord(value.languagePreferences)
      ? value.languagePreferences
      : null;
    const possibleCurrentPreferences = rawLanguagePreferences?.[profile.targetLanguage];
    const rawCurrentPreferences: Record<string, unknown> | null = isRecord(
      possibleCurrentPreferences
    )
      ? possibleCurrentPreferences
      : null;
    const storedPreferencesForCurrentLanguage =
      value.version === 3 &&
      rawCurrentPreferences !== null &&
      isLearningLevel(rawCurrentPreferences.level) &&
      isValidDailyGoal(rawCurrentPreferences.dailyGoal);

    // V1/V2 had one profile-level goal and level. Migrate them to the path that
    // was active. For a malformed V3 payload lacking current settings, do the
    // same instead of unexpectedly changing the learner's visible preferences.
    if (value.version !== 3 || !storedPreferencesForCurrentLanguage) {
      languagePreferences[profile.targetLanguage] = {
        level: profile.level,
        dailyGoal: profile.dailyGoal,
      };
    }

    // In V3 the path preference is authoritative. The profile mirrors it so
    // existing UI consumers remain simple and cannot display stale settings.
    profile = {
      ...profile,
      level: languagePreferences[profile.targetLanguage].level,
      dailyGoal: languagePreferences[profile.targetLanguage].dailyGoal,
    };
  }

  return {
    version: 3,
    profile,
    conversations,
    vocabulary,
    dailyActivity,
    languageActivity,
    languagePreferences,
    completedAchievementIds: normalizedAchievements(value.completedAchievementIds),
  };
}
