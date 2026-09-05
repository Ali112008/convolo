"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getScenario, getStarterVocabulary } from "@/lib/catalog";
import {
  createEmptyLearningData,
  createLanguageActivity,
  isTargetLanguage,
  normalizeLearningData,
} from "@/lib/learning-data";
import {
  calculateLanguageStats,
  calculateStats,
  dayKey,
  emptyActivity,
  getDayKeyForOffset,
} from "@/lib/learning-utils";
import type {
  LearningData,
  LearningProfile,
  ScenarioId,
  TargetLanguage,
  TutorTurn,
} from "@/lib/types";

const STORAGE_KEY = "convolo.local-learning-data.v1";
const XP_PER_PRACTICE_TURN = 12;
const EMPTY_DATA = createEmptyLearningData();

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
  /** All-time statistics across every saved language path. */
  stats: ReturnType<typeof calculateStats>;
  /** Statistics scoped to the learner's currently selected target language. */
  activeStats: ReturnType<typeof calculateStats>;
  prepareLearner: (input: ProfileBasics) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  startDemo: () => void;
  updateProfile: (
    updates: Partial<
      Pick<LearningProfile, "name" | "nativeLanguage" | "dailyGoal" | "level">
    >
  ) => void;
  /** Changes the active learning path without deleting past language records. */
  changeTargetLanguage: (language: TargetLanguage) => void;
  /** Starts or resumes the only unfinished conversation for a language/scene pair. */
  startConversation: (scenarioId: ScenarioId) => string;
  recordPracticeTurn: (input: RecordPracticeTurnInput) => void;
  finishConversation: (conversationId: string) => void;
  /** Removes an unfinished draft but retains earned practice time and XP. */
  discardConversation: (conversationId: string) => void;
  addWord: (input: AddWordInput) => void;
  reviewWord: (wordId: string, rating: "again" | "good" | "easy") => void;
  resetLearningData: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  language: TargetLanguage,
  values: { xp: number; minutes: number; turns: number }
): Pick<LearningData, "dailyActivity" | "languageActivity"> {
  const key = dayKey();
  const globalPrevious = data.dailyActivity[key] ?? emptyActivity();
  const languageLedger = data.languageActivity[language] ?? {};
  const languagePrevious = languageLedger[key] ?? emptyActivity();

  return {
    dailyActivity: {
      ...data.dailyActivity,
      [key]: {
        xp: globalPrevious.xp + values.xp,
        minutes: globalPrevious.minutes + values.minutes,
        turns: globalPrevious.turns + values.turns,
      },
    },
    languageActivity: {
      ...data.languageActivity,
      [language]: {
        ...languageLedger,
        [key]: {
          xp: languagePrevious.xp + values.xp,
          minutes: languagePrevious.minutes + values.minutes,
          turns: languagePrevious.turns + values.turns,
        },
      },
    },
  };
}

function starterWordsMissingFrom(
  data: LearningData,
  language: TargetLanguage,
  now: Date
) {
  const existingTerms = new Set(
    data.vocabulary
      .filter((word) => word.language === language)
      .map((word) => word.term.trim().toLocaleLowerCase())
  );

  return getStarterVocabulary(language, now).filter(
    (word) => !existingTerms.has(word.term.trim().toLocaleLowerCase())
  );
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
  const dailyActivity = {
    [getDayKeyForOffset(-2)]: { xp: 24, minutes: 5, turns: 2 },
    [getDayKeyForOffset(-1)]: { xp: 48, minutes: 9, turns: 4 },
    [getDayKeyForOffset(0)]: { xp: 36, minutes: 7, turns: 3 },
  };
  const languageActivity = createLanguageActivity();
  languageActivity.spanish = { ...dailyActivity };

  return {
    version: 2,
    profile,
    conversations: [
      {
        id: "demo-cafe-conversation",
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
    dailyActivity,
    languageActivity,
    completedAchievementIds: ["first-turn", "first-conversation", "word-collector"],
  };
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LearningData>(EMPTY_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const createdDraftIds = useRef<Record<string, string>>({});

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      let nextData = EMPTY_DATA;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          nextData = normalizeLearningData(parsed) ?? EMPTY_DATA;
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
    const joinedAt = new Date().toISOString();
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
        joinedAt: current.profile?.joinedAt ?? joinedAt,
      },
    }));
  }, []);

  const completeOnboarding = useCallback((input: OnboardingInput) => {
    const completedAt = new Date();
    setNow(completedAt.getTime());
    setData((current) => ({
      ...current,
      profile: {
        name: input.name.trim() || "Learner",
        email: input.email.trim(),
        nativeLanguage: input.nativeLanguage,
        targetLanguage: input.targetLanguage,
        level: input.level,
        dailyGoal: input.dailyGoal,
        onboarded: true,
        joinedAt: current.profile?.joinedAt ?? completedAt.toISOString(),
      },
      vocabulary: [
        ...starterWordsMissingFrom(current, input.targetLanguage, completedAt),
        ...current.vocabulary,
      ],
      languageActivity: {
        ...current.languageActivity,
        [input.targetLanguage]: current.languageActivity[input.targetLanguage] ?? {},
      },
    }));
  }, []);

  const startDemo = useCallback(() => {
    createdDraftIds.current = {};
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

  const changeTargetLanguage = useCallback((language: TargetLanguage) => {
    if (!isTargetLanguage(language)) return;
    const switchedAt = new Date();
    setNow(switchedAt.getTime());

    setData((current) => {
      if (!current.profile || current.profile.targetLanguage === language) {
        return current;
      }

      return {
        ...current,
        profile: { ...current.profile, targetLanguage: language },
        vocabulary: [
          ...starterWordsMissingFrom(current, language, switchedAt),
          ...current.vocabulary,
        ],
        languageActivity: {
          ...current.languageActivity,
          [language]: current.languageActivity[language] ?? {},
        },
      };
    });
  }, []);

  const startConversation = useCallback(
    (scenarioId: ScenarioId) => {
      const language = data.profile?.targetLanguage ?? "spanish";
      const draftKey = `${language}:${scenarioId}`;
      const existingDraft = data.conversations.find(
        (conversation) =>
          !conversation.completedAt &&
          conversation.language === language &&
          conversation.scenarioId === scenarioId
      );
      if (existingDraft) return existingDraft.id;

      const optimisticDraftId = createdDraftIds.current[draftKey];
      if (optimisticDraftId) return optimisticDraftId;

      const conversationId = makeId("conversation");
      createdDraftIds.current[draftKey] = conversationId;
      const startedAt = new Date().toISOString();
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
            startedAt,
            xpEarned: 0,
            messages: [
              {
                id: makeId("message"),
                role: "tutor",
                text: opening.opening,
                translation: opening.openingTranslation,
                createdAt: startedAt,
              },
            ],
          },
          ...current.conversations,
        ],
      }));

      return conversationId;
    },
    [data.conversations, data.profile?.targetLanguage]
  );

  const recordPracticeTurn = useCallback((input: RecordPracticeTurnInput) => {
    const recordedAt = new Date().toISOString();
    setNow(new Date(recordedAt).getTime());
    setData((current) => {
      const conversation = current.conversations.find(
        (item) => item.id === input.conversationId);
      if (!conversation || conversation.completedAt) return current;

      const alreadySaved = current.vocabulary.some(
        (word) =>
          word.language === conversation.language &&
          word.term.toLocaleLowerCase() ===
            input.tutorTurn.vocabulary.term.toLocaleLowerCase()
      );
      const updatedWords = alreadySaved
        ? current.vocabulary
        : [
            {
              id: makeId(`practice-${conversation.language}`),
              language: conversation.language,
              ...input.tutorTurn.vocabulary,
              source: "practice" as const,
              createdAt: recordedAt,
              nextReviewAt: recordedAt,
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
                  createdAt: recordedAt,
                },
                {
                  id: makeId("message"),
                  role: "tutor" as const,
                  text: input.tutorTurn.reply,
                  translation: input.tutorTurn.translation,
                  createdAt: recordedAt,
                },
              ],
            }
          : item
      );
      const activity = addActivity(current, conversation.language, {
        xp: XP_PER_PRACTICE_TURN,
        minutes: 2,
        turns: 1,
      });
      let achievementIds = addUniqueAchievement(
        current.completedAchievementIds,
        "first-turn"
      );
      if (updatedWords.length >= 5) {
        achievementIds = addUniqueAchievement(achievementIds, "word-collector");
      }

      return {
        ...current,
        ...activity,
        conversations: updatedConversations,
        vocabulary: updatedWords,
        completedAchievementIds: achievementIds,
      };
    });
  }, []);

  const finishConversation = useCallback((conversationId: string) => {
    const knownConversation = data.conversations.find(
      (conversation) => conversation.id === conversationId
    );
    if (knownConversation) {
      delete createdDraftIds.current[
        `${knownConversation.language}:${knownConversation.scenarioId}`
      ];
    }
    const completedAt = new Date().toISOString();
    setData((current) => {
      const conversation = current.conversations.find(
        (item) => item.id === conversationId
      );
      if (!conversation || conversation.completedAt) return current;

      return {
        ...current,
        conversations: current.conversations.map((item) =>
          item.id === conversationId ? { ...item, completedAt } : item
        ),
        completedAchievementIds: addUniqueAchievement(
          current.completedAchievementIds,
          "first-conversation"
        ),
      };
    });
  }, [data.conversations]);

  const discardConversation = useCallback((conversationId: string) => {
    const knownConversation = data.conversations.find(
      (conversation) => conversation.id === conversationId
    );
    if (knownConversation) {
      delete createdDraftIds.current[
        `${knownConversation.language}:${knownConversation.scenarioId}`
      ];
    }
    setData((current) => {
      const conversation = current.conversations.find(
        (item) => item.id === conversationId
      );
      if (!conversation || conversation.completedAt) return current;
      return {
        ...current,
        conversations: current.conversations.filter(
          (item) => item.id !== conversationId
        ),
      };
    });
  }, [data.conversations]);

  const addWord = useCallback((input: AddWordInput) => {
    const createdAt = new Date().toISOString();
    setNow(new Date(createdAt).getTime());
    setData((current) => {
      const language = current.profile?.targetLanguage ?? "spanish";
      const term = input.term.trim();
      const translation = input.translation.trim();
      const duplicate = current.vocabulary.some(
        (word) =>
          word.language === language &&
          word.term.toLocaleLowerCase() === term.toLocaleLowerCase()
      );
      if (duplicate || !term || !translation) return current;

      return {
        ...current,
        vocabulary: [
          {
            id: makeId("manual-word"),
            language,
            term,
            translation,
            example: input.example.trim() || term,
            notes: input.notes?.trim(),
            source: "manual",
            createdAt,
            nextReviewAt: createdAt,
            correctCount: 0,
          },
          ...current.vocabulary,
        ],
      };
    });
  }, []);

  const reviewWord = useCallback(
    (wordId: string, rating: "again" | "good" | "easy") => {
      const reviewedAt = new Date();
      setNow(reviewedAt.getTime());
      const nextReview = new Date(reviewedAt);
      if (rating === "again") {
        nextReview.setMinutes(nextReview.getMinutes() + 10);
      } else {
        const intervals = { good: 1, easy: 3 };
        nextReview.setDate(nextReview.getDate() + intervals[rating]);
      }

      setData((current) => {
        const reviewedWord = current.vocabulary.find((word) => word.id === wordId);
        if (!reviewedWord) return current;
        const activity = addActivity(current, reviewedWord.language, {
          xp: rating === "easy" ? 8 : 5,
          minutes: 1,
          turns: 0,
        });

        return {
          ...current,
          ...activity,
          vocabulary: current.vocabulary.map((word) =>
            word.id === wordId
              ? {
                  ...word,
                  correctCount:
                    rating === "again" ? word.correctCount : word.correctCount + 1,
                  lastReviewedAt: reviewedAt.toISOString(),
                  nextReviewAt: nextReview.toISOString(),
                }
              : word
          ),
        };
      });
    },
    []
  );

  const resetLearningData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    createdDraftIds.current = {};
    setData(createEmptyLearningData());
    setNow(Date.now());
  }, []);

  const stats = useMemo(() => calculateStats(data), [data]);
  const activeStats = useMemo(
    () =>
      data.profile
        ? calculateLanguageStats(data, data.profile.targetLanguage)
        : calculateStats(EMPTY_DATA),
    [data]
  );
  const value = useMemo<LearningContextValue>(
    () => ({
      data,
      hydrated,
      now,
      stats,
      activeStats,
      prepareLearner,
      completeOnboarding,
      startDemo,
      updateProfile,
      changeTargetLanguage,
      startConversation,
      recordPracticeTurn,
      finishConversation,
      discardConversation,
      addWord,
      reviewWord,
      resetLearningData,
    }),
    [
      activeStats,
      addWord,
      changeTargetLanguage,
      completeOnboarding,
      data,
      discardConversation,
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
