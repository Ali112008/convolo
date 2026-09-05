export type TargetLanguage = "spanish" | "french" | "german" | "japanese";

export type LearningLevel = "starter" | "beginner" | "intermediate" | "advanced";

/** Display language is intentionally separate from the target language being studied. */
export type InterfaceLanguage = "en" | "ar";

export type TextScale = "default" | "large";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ScenarioId = "cafe" | "introductions" | "directions" | "hotel";

export type MessageRole = "tutor" | "learner";

export interface LearningProfile {
  name: string;
  email: string;
  nativeLanguage: string;
  targetLanguage: TargetLanguage;
  level: LearningLevel;
  dailyGoal: number;
  onboarded: boolean;
  joinedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  text: string;
  translation?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  language: TargetLanguage;
  startedAt: string;
  completedAt?: string;
  messages: ConversationMessage[];
  xpEarned: number;
}

export interface VocabularyWord {
  id: string;
  language: TargetLanguage;
  term: string;
  translation: string;
  example: string;
  notes?: string;
  source: "starter" | "practice" | "manual";
  createdAt: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
  /** Successful recalls; retained for the original progress metric. */
  correctCount: number;
  /** Adaptive spaced-repetition state, measured in whole days. */
  reviewIntervalDays: number;
  /** Bounded review difficulty multiplier used for future intervals. */
  easeFactor: number;
  reviewCount: number;
  lapseCount: number;
}

export interface DailyActivity {
  xp: number;
  minutes: number;
  turns: number;
}

export type LanguageActivity = Record<TargetLanguage, Record<string, DailyActivity>>;

export interface PlacementResult {
  score: number;
  totalQuestions: number;
  recommendedLevel: LearningLevel;
  completedAt: string;
}

export interface LanguageLearningPreferences {
  level: LearningLevel;
  dailyGoal: number;
  /** The latest diagnostic result, separate for every target language. */
  placement?: PlacementResult;
}

export type LanguagePreferences = Record<
  TargetLanguage,
  LanguageLearningPreferences
>;

export interface ReminderPreferences {
  enabled: boolean;
  preferredTime: string;
}

/** Device and accessibility choices are not learning-language choices. */
export interface WorkspacePreferences {
  interfaceLanguage: InterfaceLanguage;
  textScale: TextScale;
  highContrast: boolean;
  reduceMotion: boolean;
  reminders: ReminderPreferences;
}

/**
 * Version 4 adds adaptive review state, diagnostics, and workspace preferences
 * while retaining target-language-specific activity and learning settings.
 */
export interface LearningData {
  version: 4;
  profile: LearningProfile | null;
  conversations: Conversation[];
  vocabulary: VocabularyWord[];
  /** Lifetime activity across every language. */
  dailyActivity: Record<string, DailyActivity>;
  /** Activity split by target language for the currently focused workspace. */
  languageActivity: LanguageActivity;
  /** Level and daily-goal preferences for each target language path. */
  languagePreferences: LanguagePreferences;
  /** Interface, accessibility, and reminder choices; independent of study language. */
  workspacePreferences: WorkspacePreferences;
  completedAchievementIds: string[];
}

export interface TutorCorrection {
  label: string;
  suggestion: string;
  explanation: string;
}

export interface TutorTurn {
  reply: string;
  translation: string;
  correction: TutorCorrection;
  vocabulary: Pick<VocabularyWord, "term" | "translation" | "example">;
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  description: string;
  icon: "coffee" | "users" | "map" | "hotel";
  duration: string;
  skill: string;
  languageContent: Record<
    TargetLanguage,
    {
      opening: string;
      openingTranslation: string;
      quickReplies: string[];
      goal: string;
    }
  >;
}

export interface AppStats {
  totalXp: number;
  totalMinutes: number;
  totalTurns: number;
  completedConversations: number;
  streak: number;
  todayXp: number;
  todayMinutes: number;
  todayTurns: number;
  wordsLearned: number;
}
