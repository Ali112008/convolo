export type TargetLanguage = "spanish" | "french" | "german" | "japanese";

export type LearningLevel = "starter" | "beginner" | "intermediate" | "advanced";

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
  correctCount: number;
}

export interface DailyActivity {
  xp: number;
  minutes: number;
  turns: number;
}

export interface LearningData {
  version: 1;
  profile: LearningProfile | null;
  conversations: Conversation[];
  vocabulary: VocabularyWord[];
  dailyActivity: Record<string, DailyActivity>;
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
