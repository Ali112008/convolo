"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getScenario, getStarterVocabulary } from "@/lib/catalog";
import {
  calculateStats,
  dayKey,
  emptyActivity,
  getDayKeyForOffset,
} from "@/lib/learning-utils";
import type {
  LearningData,
  LearningProfile,
  ScenarioId,
  TutorTurn,
} from "@/lib/types";

const STORAGE_KEY = "convolo.local-learning-data.v1";
const XP_PER_PRACTICE_TURN = 12;

const EMPTY_DATA: LearningData = {
  version: 1,
  profile: null,
  conversations: [],
  vocabulary: [],
  dailyActivity: {},
  completedAchievementIds: [],
};

type ProfileBasics = Pick<LearningProfile, "name" | "email">;
type OnboardingInput = ProfileBasics &
  Pick<
    LearningProfile,
    "nativeLanguage" | "targetLanguage" | "level" | "dailyGoal"
  >;

interface RecordPracticeTurnInput {
  conversationId: string;
  learnerText: string;
  tutorTurn: TutorTurn;
}

interface AddWordInput {
  term: string;
  translation: string;
  example: string;
  notes?: string;
}

interface LearningContextValue {
  data: LearningData;
  hydrated: boolean;
  now: number;
  stats: ReturnType<typeof calculateStats>;
  prepareLearner: (input: ProfileBasics) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  startDemo: () => void;
  updateProfile: (
    updates: Partial<
      Pick<LearningProfile, "name" | "nativeLanguage" | "dailyGoal" | "level">
    >
  ) => void;
  startConversation: (scenarioId: ScenarioId) => string;
  recordPracticeTurn: (input: RecordPracticeTurnInput) => void;
  finishConversation: (conversationId: string) => void;
  addWord: (input: AddWordInput) => void;
  reviewWord: (wordId: string, rating: "again" | "good" | "easy") => void;
  resetLearningData: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isLearningData(value: unknown): value is LearningData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LearningData>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.conversations) &&
    Array.isArray(candidate.vocabulary) &&
    typeof candidate.dailyActivity === "object" &&
    Array.isArray(candidate.completedAchievementIds)
  );
}

function addUniqueAchievement(
  achievementIds: string[],
  achievementId: string
): string[] {
  return achievementIds.includes(achievementId)
    ? achievementIds
    : [...achievementIds, achievementId];
}

function addActivity(
  data: LearningData,
  values: { xp: number; minutes: number; turns: number }
): LearningData["dailyActivity"] {
  const key = dayKey();
  const previous = data.dailyActivity[key] ?? emptyActivity();

  return {
    ...data.dailyActivity,
    [key]: {
      xp: previous.xp + values.xp,
      minutes: previous.minutes + values.minutes,
      turns: previous.turns + values.turns,
    },
  };
}

function createDemoData(): LearningData {
  const now = new Date();
  const profile: LearningProfile = {
    name: "Alex",
    email: "alex@convolo.demo",
    nativeLanguage: "Arabic",
    targetLanguage: "spanish",
    level: "beginner",
    dailyGoal: 10,
    onboarded: true,
    joinedAt: now.toISOString(),
  };
  const cafe = getScenario("cafe");
  const firstMessage = cafe.languageContent.spanish;
  const vocabulary = getStarterVocabulary("spanish", now).map((word, index) => ({
    ...word,
    correctCount: index < 3 ? index + 1 : 0,
    lastReviewedAt: index < 3 ? now.toISOString() : undefined,
  }));
  const demoConversationId = "demo-cafe-conversation";

  return {
    version: 1,
    profile,
    conversations: [
      {
        id: demoConversationId,
        scenarioId: "cafe",
        scenarioTitle: cafe.title,
        language: "spanish",
        startedAt: now.toISOString(),
        completedAt: now.toISOString(),
        xpEarned: 36,
        messages: [
          {
            id: "demo-opening",
            role: "tutor",
            text: firstMessage.opening,
            translation: firstMessage.openingTranslation,
            createdAt: now.toISOString(),
          },
          {
            id: "demo-learner",
            role: "learner",
            text: "Quisiera un café, por favor.",
            createdAt: now.toISOString(),
          },
          {
            id: "demo-reply",
            role: "tutor",
            text: "¡Perfecto! Ahora mismo te lo preparo.",
            translation: "Perfect! I will prepare it right away.",
            createdAt: now.toISOString(),
          },
        ],
      },
    ],
    vocabulary,
    dailyActivity: {
      [getDayKeyForOffset(-2)]: { xp: 24, minutes: 5, turns: 2 },
      [getDayKeyForOffset(-1)]: { xp: 48, minutes: 9, turns: 4 },
      [getDayKeyForOffset(0)]: { xp: 36, minutes: 7, turns: 3 },
    },
    completedAchievementIds: ["first-turn", "first-conversation", "word-collector"],
  };
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LearningData>(EMPTY_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      let nextData = EMPTY_DATA;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isLearningData(parsed)) {
            nextData = parsed;
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setData(nextData);
      setNow(Date.now());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const clock = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(clock);
  }, [hydrated]);

  const prepareLearner = useCallback((input: ProfileBasics) => {
    const now = new Date().toISOString();
    setData((current) => ({
      ...current,
      profile: {
        name: input.name.trim() || "Learner",
        email: input.email.trim(),
        nativeLanguage: current.profile?.nativeLanguage ?? "Arabic",
        targetLanguage: current.profile?.targetLanguage ?? "spanish",
        level: current.profile?.level ?? "starter",
        dailyGoal: current.profile?.dailyGoal ?? 10,
        onboarded: false,
        joinedAt: current.profile?.joinedAt ?? now,
      },
    }));
  }, []);

  const completeOnboarding = useCallback((input: OnboardingInput) => {
    const now = new Date();
    setNow(now.getTime());
    setData((current) => {
      const hasWordsForLanguage = current.vocabulary.some(
        (word) => word.language === input.targetLanguage
      );
      return {
        ...current,
        profile: {
          name: input.name.trim() || "Learner",
          email: input.email.trim(),
          nativeLanguage: input.nativeLanguage,
          targetLanguage: input.targetLanguage,
          level: input.level,
          dailyGoal: input.dailyGoal,
          onboarded: true,
          joinedAt: current.profile?.joinedAt ?? now.toISOString(),
        },
        vocabulary: hasWordsForLanguage
          ? current.vocabulary
          : [...getStarterVocabulary(input.targetLanguage, now), ...current.vocabulary],
      };
    });
  }, []);

  const startDemo = useCallback(() => {
    setData(createDemoData());
    setNow(Date.now());
  }, []);

  const updateProfile = useCallback(
    (
      updates: Partial<
        Pick<LearningProfile, "name" | "nativeLanguage" | "dailyGoal" | "level">
      >
    ) => {
      setData((current) => {
        if (!current.profile) return current;
        return {
          ...current,
          profile: { ...current.profile, ...updates },
        };
      });
    },
    []
  );

  const startConversation = useCallback(
    (scenarioId: ScenarioId) => {
      const conversationId = makeId("conversation");
      const now = new Date().toISOString();
      const language = data.profile?.targetLanguage ?? "spanish";
      const scenario = getScenario(scenarioId);
      const opening = scenario.languageContent[language];

      setData((current) => ({
        ...current,
        conversations: [
          {
            id: conversationId,
            scenarioId,
            scenarioTitle: scenario.title,
            language,
            startedAt: now,
            xpEarned: 0,
            messages: [
              {
                id: makeId("message"),
                role: "tutor",
                text: opening.opening,
                translation: opening.openingTranslation,
                createdAt: now,
              },
            ],
          },
          ...current.conversations,
        ],
      }));

      return conversationId;
    },
    [data.profile?.targetLanguage]
  );

  const recordPracticeTurn = useCallback((input: RecordPracticeTurnInput) => {
    const now = new Date().toISOString();
    setNow(new Date(now).getTime());
    setData((current) => {
      const conversation = current.conversations.find(
        (item) => item.id === input.conversationId
      );
      if (!conversation) return current;

      const wordId = makeId(`practice-${conversation.language}`);
      const alreadySaved = current.vocabulary.some(
        (word) => word.term.toLowerCase() === input.tutorTurn.vocabulary.term.toLowerCase()
      );
      const updatedWords = alreadySaved
        ? current.vocabulary
        : [
            {
              id: wordId,
              language: conversation.language,
              ...input.tutorTurn.vocabulary,
              source: "practice" as const,
              createdAt: now,
              nextReviewAt: now,
              correctCount: 0,
            },
            ...current.vocabulary,
          ];

      const updatedConversations = current.conversations.map((item) =>
        item.id === input.conversationId
          ? {
              ...item,
              xpEarned: item.xpEarned + XP_PER_PRACTICE_TURN,
              messages: [
                ...item.messages,
                {
                  id: makeId("message"),
                  role: "learner" as const,
                  text: input.learnerText,
                  createdAt: now,
                },
                {
                  id: makeId("message"),
                  role: "tutor" as const,
                  text: input.tutorTurn.reply,
                  translation: input.tutorTurn.translation,
                  createdAt: now,
                },
              ],
            }
          : item
      );
      let achievementIds = addUniqueAchievement(
        current.completedAchievementIds,
        "first-turn"
      );
      if (updatedWords.length >= 5) {
        achievementIds = addUniqueAchievement(achievementIds, "word-collector");
      }

      return {
        ...current,
        conversations: updatedConversations,
        vocabulary: updatedWords,
        dailyActivity: addActivity(current, {
          xp: XP_PER_PRACTICE_TURN,
          minutes: 2,
          turns: 1,
        }),
        completedAchievementIds: achievementIds,
      };
    });
  }, []);

  const finishConversation = useCallback((conversationId: string) => {
    const now = new Date().toISOString();
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId && !conversation.completedAt
          ? { ...conversation, completedAt: now }
          : conversation
      ),
      completedAchievementIds: addUniqueAchievement(
        current.completedAchievementIds,
        "first-conversation"
      ),
    }));
  }, []);

  const addWord = useCallback((input: AddWordInput) => {
    const now = new Date().toISOString();
    setNow(new Date(now).getTime());
    setData((current) => {
      const language = current.profile?.targetLanguage ?? "spanish";
      const duplicate = current.vocabulary.some(
        (word) => word.term.toLowerCase() === input.term.trim().toLowerCase()
      );
      if (duplicate || !input.term.trim() || !input.translation.trim()) return current;

      return {
        ...current,
        vocabulary: [
          {
            id: makeId("manual-word"),
            language,
            term: input.term.trim(),
            translation: input.translation.trim(),
            example: input.example.trim() || input.term.trim(),
            notes: input.notes?.trim(),
            source: "manual",
            createdAt: now,
            nextReviewAt: now,
            correctCount: 0,
          },
          ...current.vocabulary,
        ],
      };
    });
  }, []);

  const reviewWord = useCallback(
    (wordId: string, rating: "again" | "good" | "easy") => {
      const now = new Date();
      setNow(now.getTime());
      const nextReview = new Date(now);
      if (rating === "again") {
        nextReview.setMinutes(nextReview.getMinutes() + 10);
      } else {
        const intervals = { good: 1, easy: 3 };
        nextReview.setDate(nextReview.getDate() + intervals[rating]);
      }

      setData((current) => ({
        ...current,
        vocabulary: current.vocabulary.map((word) =>
          word.id === wordId
            ? {
                ...word,
                correctCount:
                  rating === "again" ? word.correctCount : word.correctCount + 1,
                lastReviewedAt: now.toISOString(),
                nextReviewAt: nextReview.toISOString(),
              }
            : word
        ),
        dailyActivity: addActivity(current, {
          xp: rating === "easy" ? 8 : 5,
          minutes: 1,
          turns: 0,
        }),
      }));
    },
    []
  );

  const resetLearningData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setData(EMPTY_DATA);
  }, []);

  const stats = useMemo(() => calculateStats(data), [data]);
  const value = useMemo<LearningContextValue>(
    () => ({
      data,
      hydrated,
      now,
      stats,
      prepareLearner,
      completeOnboarding,
      startDemo,
      updateProfile,
      startConversation,
      recordPracticeTurn,
      finishConversation,
      addWord,
      reviewWord,
      resetLearningData,
    }),
    [
      addWord,
      completeOnboarding,
      data,
      finishConversation,
      hydrated,
      now,
      prepareLearner,
      recordPracticeTurn,
      resetLearningData,
      reviewWord,
      startConversation,
      startDemo,
      stats,
      updateProfile,
    ]
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used inside LearningProvider");
  }
  return context;
}
