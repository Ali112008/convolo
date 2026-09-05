import type {
  AppStats,
  Conversation,
  DailyActivity,
  LearningData,
  TargetLanguage,
  VocabularyWord,
} from "./types";

const DAY_IN_MS = 86_400_000;

export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateForOffset(offset: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setTime(date.getTime() + offset * DAY_IN_MS);
  return date;
}

export function getDayKeyForOffset(offset: number): string {
  return dayKey(dateForOffset(offset));
}

export function emptyActivity(): DailyActivity {
  return { xp: 0, minutes: 0, turns: 0 };
}

export function calculateStreak(dailyActivity: Record<string, DailyActivity>): number {
  let streak = 0;
  let offset = 0;

  if ((dailyActivity[getDayKeyForOffset(0)]?.turns ?? 0) === 0) {
    offset = -1;
  }

  while ((dailyActivity[getDayKeyForOffset(offset)]?.turns ?? 0) > 0) {
    streak += 1;
    offset -= 1;
  }

  return streak;
}

export function calculateStatsFromActivity(
  dailyActivity: Record<string, DailyActivity>,
  conversations: Conversation[],
  vocabulary: VocabularyWord[]
): AppStats {
  const activityEntries = Object.values(dailyActivity);
  const totalXp = activityEntries.reduce((sum, activity) => sum + activity.xp, 0);
  const totalMinutes = activityEntries.reduce(
    (sum, activity) => sum + activity.minutes,
    0
  );
  const totalTurns = activityEntries.reduce((sum, activity) => sum + activity.turns, 0);
  const today = dailyActivity[dayKey()] ?? emptyActivity();

  return {
    totalXp,
    totalMinutes,
    totalTurns,
    completedConversations: conversations.filter((conversation) => conversation.completedAt)
      .length,
    streak: calculateStreak(dailyActivity),
    todayXp: today.xp,
    todayMinutes: today.minutes,
    todayTurns: today.turns,
    wordsLearned: vocabulary.filter((word) => word.correctCount > 0).length,
  };
}

/** Returns all-time statistics across every target language. */
export function calculateStats(data: LearningData): AppStats {
  return calculateStatsFromActivity(
    data.dailyActivity,
    data.conversations,
    data.vocabulary
  );
}

/** Returns statistics for one target language without mixing past language paths. */
export function calculateLanguageStats(
  data: LearningData,
  language: TargetLanguage
): AppStats {
  return calculateStatsFromActivity(
    data.languageActivity[language] ?? {},
    data.conversations.filter((conversation) => conversation.language === language),
    data.vocabulary.filter((word) => word.language === language)
  );
}

export function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function relativeDayLabel(offset: number): string {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
    dateForOffset(offset)
  );
}
