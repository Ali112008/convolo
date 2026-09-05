import { SCENARIOS } from "./catalog";
import { sortReviewQueue } from "./review-scheduling";
import type {
  LearningData,
  LearningLevel,
  ScenarioId,
  TargetLanguage,
} from "./types";

export interface PlacementQuestion {
  id: string;
  skill: string;
  prompt: string;
  helper: string;
  choices: string[];
  correctChoiceIndex: number;
}

export interface AdaptiveRecommendation {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  href: "/app/plan" | "/app/practice" | "/app/vocabulary";
  scenarioId?: ScenarioId;
}

const QUESTION_SETS: Record<TargetLanguage, PlacementQuestion[]> = {
  spanish: [
    {
      id: "es-greeting",
      skill: "Everyday greeting",
      prompt: "Which phrase means “Hello, nice to meet you”?",
      helper: "Choose the most natural Spanish option.",
      choices: ["Hola, mucho gusto.", "Gracias, hasta luego.", "¿Dónde está la estación?"],
      correctChoiceIndex: 0,
    },
    {
      id: "es-order",
      skill: "Polite requests",
      prompt: "Choose the polite way to say “I would like a coffee, please.”",
      helper: "Look for a complete café request.",
      choices: ["Quisiera un café, por favor.", "Yo café ahora.", "Café es aquí."],
      correctChoiceIndex: 0,
    },
    {
      id: "es-question",
      skill: "Asking directions",
      prompt: "What does “¿Dónde está la estación?” ask?",
      helper: "Read the whole question before deciding.",
      choices: ["Where is the station?", "When is the station open?", "Who works at the station?"],
      correctChoiceIndex: 0,
    },
    {
      id: "es-context",
      skill: "Conversation context",
      prompt: "A waiter asks “¿Quieres leche o azúcar?” What are they offering?",
      helper: "Use the key words leche and azúcar.",
      choices: ["Milk or sugar", "Tea or juice", "A table or a menu"],
      correctChoiceIndex: 0,
    },
    {
      id: "es-natural",
      skill: "Natural phrasing",
      prompt: "Which reply sounds most natural after meeting someone?",
      helper: "Pick the warm, complete response.",
      choices: ["Mucho gusto, me llamo Sam.", "Yo nombre Sam mucho.", "Sam es gusto."],
      correctChoiceIndex: 0,
    },
    {
      id: "es-meaning",
      skill: "Meaning in context",
      prompt: "“No está lejos. Puedes ir a pie.” means…",
      helper: "Focus on lejos and a pie.",
      choices: ["It is not far; you can walk.", "It is closed; come tomorrow.", "It is expensive; take a taxi."],
      correctChoiceIndex: 0,
    },
  ],
  french: [
    {
      id: "fr-greeting",
      skill: "Everyday greeting",
      prompt: "Which phrase means “Hello, nice to meet you”?",
      helper: "Choose the most natural French option.",
      choices: ["Bonjour, enchanté.", "Merci, à demain.", "Où est la gare ?"],
      correctChoiceIndex: 0,
    },
    {
      id: "fr-order",
      skill: "Polite requests",
      prompt: "Choose the polite way to say “I would like a coffee, please.”",
      helper: "Look for a complete café request.",
      choices: ["Je voudrais un café, s'il vous plaît.", "Moi café maintenant.", "Café est ici."],
      correctChoiceIndex: 0,
    },
    {
      id: "fr-question",
      skill: "Asking directions",
      prompt: "What does “Où est la gare ?” ask?",
      helper: "Read the whole question before deciding.",
      choices: ["Where is the station?", "When is the station open?", "Who works at the station?"],
      correctChoiceIndex: 0,
    },
    {
      id: "fr-context",
      skill: "Conversation context",
      prompt: "A waiter asks “Vous voulez du lait ou du sucre ?” What are they offering?",
      helper: "Use the key words lait and sucre.",
      choices: ["Milk or sugar", "Tea or juice", "A table or a menu"],
      correctChoiceIndex: 0,
    },
    {
      id: "fr-natural",
      skill: "Natural phrasing",
      prompt: "Which reply sounds most natural after meeting someone?",
      helper: "Pick the warm, complete response.",
      choices: ["Enchanté, je m'appelle Sam.", "Je Sam beaucoup plaisir.", "Sam est enchanté."],
      correctChoiceIndex: 0,
    },
    {
      id: "fr-meaning",
      skill: "Meaning in context",
      prompt: "“Ce n'est pas loin. Vous pouvez y aller à pied.” means…",
      helper: "Focus on loin and à pied.",
      choices: ["It is not far; you can walk there.", "It is closed; come tomorrow.", "It is expensive; take a taxi."],
      correctChoiceIndex: 0,
    },
  ],
  german: [
    {
      id: "de-greeting",
      skill: "Everyday greeting",
      prompt: "Which phrase means “Hello, nice to meet you”?",
      helper: "Choose the most natural German option.",
      choices: ["Hallo, freut mich.", "Danke, bis morgen.", "Wo ist der Bahnhof?"],
      correctChoiceIndex: 0,
    },
    {
      id: "de-order",
      skill: "Polite requests",
      prompt: "Choose the polite way to say “I would like a coffee, please.”",
      helper: "Look for a complete café request.",
      choices: ["Ich hätte gern einen Kaffee, bitte.", "Ich Kaffee jetzt.", "Kaffee ist hier."],
      correctChoiceIndex: 0,
    },
    {
      id: "de-question",
      skill: "Asking directions",
      prompt: "What does “Wo ist der Bahnhof?” ask?",
      helper: "Read the whole question before deciding.",
      choices: ["Where is the station?", "When is the station open?", "Who works at the station?"],
      correctChoiceIndex: 0,
    },
    {
      id: "de-context",
      skill: "Conversation context",
      prompt: "A waiter asks “Möchten Sie Milch oder Zucker?” What are they offering?",
      helper: "Use the key words Milch and Zucker.",
      choices: ["Milk or sugar", "Tea or juice", "A table or a menu"],
      correctChoiceIndex: 0,
    },
    {
      id: "de-natural",
      skill: "Natural phrasing",
      prompt: "Which reply sounds most natural after meeting someone?",
      helper: "Pick the warm, complete response.",
      choices: ["Ich heiße Sam. Freut mich.", "Ich Sam sehr Freude.", "Sam ist freut."],
      correctChoiceIndex: 0,
    },
    {
      id: "de-meaning",
      skill: "Meaning in context",
      prompt: "“Er ist ganz nah. Sie können zu Fuß gehen.” means…",
      helper: "Focus on ganz nah and zu Fuß.",
      choices: ["It is very close; you can walk.", "It is closed; come tomorrow.", "It is expensive; take a taxi."],
      correctChoiceIndex: 0,
    },
  ],
  japanese: [
    {
      id: "ja-greeting",
      skill: "Everyday greeting",
      prompt: "Which phrase means “Hello, nice to meet you”?",
      helper: "Choose the most natural Japanese option.",
      choices: ["こんにちは。はじめまして。", "ありがとう。明日。", "駅はどこですか。"],
      correctChoiceIndex: 0,
    },
    {
      id: "ja-order",
      skill: "Polite requests",
      prompt: "Choose the polite way to say “Coffee, please.”",
      helper: "Look for a complete café request.",
      choices: ["コーヒーをください。", "コーヒー今。", "コーヒーここ。"],
      correctChoiceIndex: 0,
    },
    {
      id: "ja-question",
      skill: "Asking directions",
      prompt: "What does “駅はどこですか。” ask?",
      helper: "Read the whole question before deciding.",
      choices: ["Where is the station?", "When is the station open?", "Who works at the station?"],
      correctChoiceIndex: 0,
    },
    {
      id: "ja-context",
      skill: "Conversation context",
      prompt: "A waiter asks “ミルクか砂糖はいかがですか。” What are they offering?",
      helper: "Use the key words ミルク and 砂糖.",
      choices: ["Milk or sugar", "Tea or juice", "A table or a menu"],
      correctChoiceIndex: 0,
    },
    {
      id: "ja-natural",
      skill: "Natural phrasing",
      prompt: "Which reply sounds most natural after meeting someone?",
      helper: "Pick the warm, complete response.",
      choices: ["サムです。はじめまして。", "サム、たくさん会う。", "サムは初め。"],
      correctChoiceIndex: 0,
    },
    {
      id: "ja-meaning",
      skill: "Meaning in context",
      prompt: "“近いです。歩いて行けます。” means…",
      helper: "Focus on 近い and 歩いて.",
      choices: ["It is close; you can walk.", "It is closed; come tomorrow.", "It is expensive; take a taxi."],
      correctChoiceIndex: 0,
    },
  ],
};

export function getPlacementQuestions(language: TargetLanguage): PlacementQuestion[] {
  return QUESTION_SETS[language];
}

export function recommendLevelFromPlacement(
  score: number,
  totalQuestions: number
): LearningLevel {
  const percentage = totalQuestions > 0 ? score / totalQuestions : 0;
  if (percentage < 1 / 3) return "starter";
  if (percentage < 2 / 3) return "beginner";
  if (percentage < 1) return "intermediate";
  return "advanced";
}

function recommendedScenarioId(level: LearningLevel, completedScenarioIds: Set<ScenarioId>): ScenarioId {
  const preferredOrder: Record<LearningLevel, ScenarioId[]> = {
    starter: ["cafe", "introductions", "directions", "hotel"],
    beginner: ["introductions", "cafe", "directions", "hotel"],
    intermediate: ["directions", "hotel", "introductions", "cafe"],
    advanced: ["hotel", "directions", "introductions", "cafe"],
  };
  return (
    preferredOrder[level].find((scenarioId) => !completedScenarioIds.has(scenarioId)) ??
    preferredOrder[level][0]
  );
}

export function getAdaptiveRecommendation(
  data: LearningData,
  language: TargetLanguage,
  now: number
): AdaptiveRecommendation {
  const preferences = data.languagePreferences[language];
  const languageWords = data.vocabulary.filter((word) => word.language === language);
  const dueWords = sortReviewQueue(languageWords, now);
  const completedScenarioIds = new Set(
    data.conversations
      .filter((conversation) => conversation.language === language && conversation.completedAt)
      .map((conversation) => conversation.scenarioId)
  );

  if (!preferences.placement) {
    return {
      eyebrow: "START WITH A SIGNAL",
      title: "Find your right starting point",
      description:
        "Take the six-question placement check. It saves a recommendation, but never changes your level without your approval.",
      actionLabel: "Take placement check",
      href: "/app/plan",
    };
  }

  if (dueWords.length > 0) {
    const fragileWord = dueWords[0];
    return {
      eyebrow: "MEMORY FIRST",
      title: `${dueWords.length} phrase${dueWords.length === 1 ? "" : "s"} need a quick recall`,
      description: `${fragileWord.term} is at the front of your adaptive review queue. A short recall now protects your momentum.`,
      actionLabel: "Review due phrases",
      href: "/app/vocabulary",
    };
  }

  const scenarioId = recommendedScenarioId(preferences.level, completedScenarioIds);
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
  const hasRecentPractice = data.conversations.some(
    (conversation) =>
      conversation.language === language &&
      conversation.completedAt &&
      now - new Date(conversation.completedAt).getTime() < 7 * 86_400_000
  );

  return {
    eyebrow: hasRecentPractice ? "KEEP BUILDING" : "YOUR NEXT SCENE",
    title: scenario.title,
    description: `This ${scenario.skill.toLowerCase()} scene fits your ${preferences.level} path and gives your saved vocabulary a useful context.`,
    actionLabel: "Practice this scene",
    href: "/app/practice",
    scenarioId,
  };
}
