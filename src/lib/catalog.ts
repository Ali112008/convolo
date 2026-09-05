import type {
  LearningLevel,
  Scenario,
  ScenarioId,
  TargetLanguage,
  TutorTurn,
  VocabularyWord,
} from "./types";

export const TARGET_LANGUAGES: Array<{
  id: TargetLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}> = [
  { id: "spanish", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { id: "french", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { id: "german", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { id: "japanese", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
];

export const NATIVE_LANGUAGES = [
  "Arabic",
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Other",
];

export const LEVELS: Array<{
  id: LearningLevel;
  title: string;
  description: string;
}> = [
  {
    id: "starter",
    title: "Starting from zero",
    description: "I know a few words, but cannot form sentences yet.",
  },
  {
    id: "beginner",
    title: "Beginner",
    description: "I can handle greetings and very simple situations.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can chat about familiar topics and want more fluency.",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "I want to sound natural in nuanced conversations.",
  },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "At the café",
    description: "Order a drink and make a small request politely.",
    icon: "coffee",
    duration: "5 min",
    skill: "Polite requests",
    languageContent: {
      spanish: {
        opening: "¡Hola! Bienvenido a La Plaza. ¿Qué te gustaría tomar?",
        openingTranslation: "Hello! Welcome to La Plaza. What would you like to drink?",
        quickReplies: ["Quisiera un café, por favor.", "¿Tienen té?", "Un café con leche, por favor."],
        goal: "Order a drink and ask one follow-up question.",
      },
      french: {
        opening: "Bonjour et bienvenue au Café Lumière. Qu'est-ce que vous désirez ?",
        openingTranslation: "Hello and welcome to Café Lumière. What would you like?",
        quickReplies: ["Je voudrais un café, s'il vous plaît.", "Vous avez du thé ?", "Un café au lait, s'il vous plaît."],
        goal: "Order a drink and ask one follow-up question.",
      },
      german: {
        opening: "Hallo und willkommen im Café Morgen. Was möchten Sie trinken?",
        openingTranslation: "Hello and welcome to Café Morgen. What would you like to drink?",
        quickReplies: ["Ich hätte gern einen Kaffee, bitte.", "Haben Sie Tee?", "Einen Milchkaffee, bitte."],
        goal: "Order a drink and ask one follow-up question.",
      },
      japanese: {
        opening: "こんにちは。カフェ・モリへようこそ。何になさいますか。",
        openingTranslation: "Hello. Welcome to Café Mori. What would you like?",
        quickReplies: ["コーヒーをください。", "お茶はありますか。", "カフェラテをお願いします。"],
        goal: "Order a drink and ask one follow-up question.",
      },
    },
  },
  {
    id: "introductions",
    title: "Meeting someone new",
    description: "Introduce yourself and ask friendly questions.",
    icon: "users",
    duration: "6 min",
    skill: "Introductions",
    languageContent: {
      spanish: {
        opening: "¡Hola! Me llamo Sofía. Mucho gusto. ¿Cómo te llamas?",
        openingTranslation: "Hi! My name is Sofía. Nice to meet you. What is your name?",
        quickReplies: ["Me llamo Alex. Mucho gusto.", "Soy de Egipto.", "¿De dónde eres?"],
        goal: "Introduce yourself and ask where the other person is from.",
      },
      french: {
        opening: "Bonjour ! Je m'appelle Sophie. Enchantée. Comment tu t'appelles ?",
        openingTranslation: "Hi! My name is Sophie. Nice to meet you. What is your name?",
        quickReplies: ["Je m'appelle Alex. Enchanté.", "Je viens d'Égypte.", "Tu viens d'où ?"],
        goal: "Introduce yourself and ask where the other person is from.",
      },
      german: {
        opening: "Hallo! Ich heiße Sophie. Freut mich. Wie heißt du?",
        openingTranslation: "Hi! My name is Sophie. Nice to meet you. What is your name?",
        quickReplies: ["Ich heiße Alex. Freut mich.", "Ich komme aus Ägypten.", "Woher kommst du?"],
        goal: "Introduce yourself and ask where the other person is from.",
      },
      japanese: {
        opening: "こんにちは。ソフィーです。はじめまして。お名前は何ですか。",
        openingTranslation: "Hello. I am Sophie. Nice to meet you. What is your name?",
        quickReplies: ["アレックスです。はじめまして。", "エジプトから来ました。", "どこから来ましたか。"],
        goal: "Introduce yourself and ask where the other person is from.",
      },
    },
  },
  {
    id: "directions",
    title: "Finding your way",
    description: "Ask for directions and understand a simple route.",
    icon: "map",
    duration: "7 min",
    skill: "Questions & directions",
    languageContent: {
      spanish: {
        opening: "Perdona, ¿puedo ayudarte? Parece que buscas algo.",
        openingTranslation: "Excuse me, can I help you? It looks like you are looking for something.",
        quickReplies: ["¿Dónde está la estación?", "Busco el museo.", "¿Está lejos?"],
        goal: "Ask where a place is and confirm whether it is far away.",
      },
      french: {
        opening: "Excusez-moi, je peux vous aider ? Vous cherchez quelque chose ?",
        openingTranslation: "Excuse me, can I help you? Are you looking for something?",
        quickReplies: ["Où est la gare ?", "Je cherche le musée.", "C'est loin ?"],
        goal: "Ask where a place is and confirm whether it is far away.",
      },
      german: {
        opening: "Entschuldigung, kann ich Ihnen helfen? Suchen Sie etwas?",
        openingTranslation: "Excuse me, can I help you? Are you looking for something?",
        quickReplies: ["Wo ist der Bahnhof?", "Ich suche das Museum.", "Ist es weit?"],
        goal: "Ask where a place is and confirm whether it is far away.",
      },
      japanese: {
        opening: "すみません、何かお探しですか。",
        openingTranslation: "Excuse me, are you looking for something?",
        quickReplies: ["駅はどこですか。", "美術館を探しています。", "遠いですか。"],
        goal: "Ask where a place is and confirm whether it is far away.",
      },
    },
  },
  {
    id: "hotel",
    title: "Checking into a hotel",
    description: "Confirm a reservation and ask for practical information.",
    icon: "hotel",
    duration: "8 min",
    skill: "Travel essentials",
    languageContent: {
      spanish: {
        opening: "Buenas tardes. Bienvenido al Hotel Sol. ¿Tiene una reserva?",
        openingTranslation: "Good afternoon. Welcome to Hotel Sol. Do you have a reservation?",
        quickReplies: ["Sí, tengo una reserva a nombre de Alex.", "¿A qué hora es el desayuno?", "¿Dónde está mi habitación?"],
        goal: "Confirm a reservation and ask about breakfast or your room.",
      },
      french: {
        opening: "Bonsoir. Bienvenue à l'Hôtel Soleil. Vous avez une réservation ?",
        openingTranslation: "Good evening. Welcome to Hotel Soleil. Do you have a reservation?",
        quickReplies: ["Oui, j'ai une réservation au nom d'Alex.", "Le petit déjeuner est à quelle heure ?", "Où est ma chambre ?"],
        goal: "Confirm a reservation and ask about breakfast or your room.",
      },
      german: {
        opening: "Guten Abend. Willkommen im Hotel Sonne. Haben Sie eine Reservierung?",
        openingTranslation: "Good evening. Welcome to Hotel Sonne. Do you have a reservation?",
        quickReplies: ["Ja, ich habe eine Reservierung auf Alex.", "Wann gibt es Frühstück?", "Wo ist mein Zimmer?"],
        goal: "Confirm a reservation and ask about breakfast or your room.",
      },
      japanese: {
        opening: "こんばんは。ホテル・ソルへようこそ。ご予約はありますか。",
        openingTranslation: "Good evening. Welcome to Hotel Sol. Do you have a reservation?",
        quickReplies: ["はい、アレックスの名前で予約しています。", "朝食は何時ですか。", "部屋はどこですか。"],
        goal: "Confirm a reservation and ask about breakfast or your room.",
      },
    },
  },
];

const LANGUAGE_LABELS: Record<TargetLanguage, string> = {
  spanish: "Spanish",
  french: "French",
  german: "German",
  japanese: "Japanese",
};

const STARTER_WORDS: Record<
  TargetLanguage,
  Array<Pick<VocabularyWord, "term" | "translation" | "example">>
> = {
  spanish: [
    { term: "hola", translation: "hello", example: "Hola, mucho gusto." },
    { term: "por favor", translation: "please", example: "Un café, por favor." },
    { term: "gracias", translation: "thank you", example: "Gracias por tu ayuda." },
    { term: "quisiera", translation: "I would like", example: "Quisiera una mesa." },
  ],
  french: [
    { term: "bonjour", translation: "hello", example: "Bonjour, enchanté." },
    { term: "s'il vous plaît", translation: "please", example: "Un café, s'il vous plaît." },
    { term: "merci", translation: "thank you", example: "Merci beaucoup." },
    { term: "je voudrais", translation: "I would like", example: "Je voudrais une table." },
  ],
  german: [
    { term: "hallo", translation: "hello", example: "Hallo, wie geht es dir?" },
    { term: "bitte", translation: "please / you are welcome", example: "Einen Kaffee, bitte." },
    { term: "danke", translation: "thank you", example: "Danke für deine Hilfe." },
    { term: "ich hätte gern", translation: "I would like", example: "Ich hätte gern einen Tee." },
  ],
  japanese: [
    { term: "こんにちは", translation: "hello", example: "こんにちは。お元気ですか。" },
    { term: "お願いします", translation: "please", example: "コーヒーをお願いします。" },
    { term: "ありがとう", translation: "thank you", example: "ありがとうございます。" },
    { term: "ください", translation: "please give me", example: "水をください。" },
  ],
};

const TUTOR_PHRASES: Record<
  TargetLanguage,
  Record<
    ScenarioId,
    {
      reply: string[];
      translation: string[];
      suggestion: string;
      explanation: string;
      vocabulary: Pick<VocabularyWord, "term" | "translation" | "example">;
    }
  >
> = {
  spanish: {
    cafe: {
      reply: ["¡Perfecto! Ahora mismo te lo preparo.", "Claro. ¿Quieres leche o azúcar?"],
      translation: ["Perfect! I will prepare it right away.", "Of course. Would you like milk or sugar?"],
      suggestion: "Quisiera un café, por favor.",
      explanation: "Quisiera is a friendly, polite way to say I would like.",
      vocabulary: { term: "quisiera", translation: "I would like", example: "Quisiera un café, por favor." },
    },
    introductions: {
      reply: ["¡Mucho gusto! Me alegra conocerte.", "¡Qué interesante! ¿Qué te gusta hacer?"],
      translation: ["Nice to meet you! I am happy to meet you.", "How interesting! What do you like to do?"],
      suggestion: "Me llamo Alex. Mucho gusto.",
      explanation: "Me llamo is the natural way to introduce your name.",
      vocabulary: { term: "mucho gusto", translation: "nice to meet you", example: "Mucho gusto, soy Ana." },
    },
    directions: {
      reply: ["La estación está a dos calles de aquí.", "No, está muy cerca. Puedes ir a pie."],
      translation: ["The station is two blocks from here.", "No, it is very close. You can walk."],
      suggestion: "¿Dónde está la estación?",
      explanation: "Dónde está is the go-to question for asking where a place is.",
      vocabulary: { term: "la estación", translation: "the station", example: "¿Dónde está la estación?" },
    },
    hotel: {
      reply: ["Sí, la encuentro. Su habitación está lista.", "El desayuno se sirve de siete a diez."],
      translation: ["Yes, I can find it. Your room is ready.", "Breakfast is served from seven to ten."],
      suggestion: "Tengo una reserva a nombre de Alex.",
      explanation: "A nombre de introduces the name connected to a reservation.",
      vocabulary: { term: "una reserva", translation: "a reservation", example: "Tengo una reserva a nombre de Alex." },
    },
  },
  french: {
    cafe: {
      reply: ["Très bien, je vous prépare cela tout de suite.", "Bien sûr. Vous voulez du lait ou du sucre ?"],
      translation: ["Very well, I will prepare that right away.", "Of course. Would you like milk or sugar?"],
      suggestion: "Je voudrais un café, s'il vous plaît.",
      explanation: "Je voudrais is a courteous way to place an order.",
      vocabulary: { term: "je voudrais", translation: "I would like", example: "Je voudrais un café, s'il vous plaît." },
    },
    introductions: {
      reply: ["Enchantée ! Je suis ravie de faire ta connaissance.", "C'est super ! Qu'est-ce que tu aimes faire ?"],
      translation: ["Nice to meet you! I am delighted to meet you.", "That is great! What do you like to do?"],
      suggestion: "Je m'appelle Alex. Enchanté.",
      explanation: "Je m'appelle is the standard, natural self-introduction.",
      vocabulary: { term: "enchanté", translation: "nice to meet you", example: "Enchanté de faire votre connaissance." },
    },
    directions: {
      reply: ["La gare est à deux rues d'ici.", "Non, ce n'est pas loin. Vous pouvez y aller à pied."],
      translation: ["The station is two streets from here.", "No, it is not far. You can walk there."],
      suggestion: "Où est la gare ?",
      explanation: "Où est is a compact, useful way to ask for a location.",
      vocabulary: { term: "la gare", translation: "the station", example: "Où est la gare ?" },
    },
    hotel: {
      reply: ["Oui, je la trouve. Votre chambre est prête.", "Le petit déjeuner est servi de sept à dix heures."],
      translation: ["Yes, I can find it. Your room is ready.", "Breakfast is served from seven to ten."],
      suggestion: "J'ai une réservation au nom d'Alex.",
      explanation: "Au nom de identifies the name used for a booking.",
      vocabulary: { term: "une réservation", translation: "a reservation", example: "J'ai une réservation au nom d'Alex." },
    },
  },
  german: {
    cafe: {
      reply: ["Sehr gern, ich bereite das sofort zu.", "Natürlich. Möchten Sie Milch oder Zucker?"],
      translation: ["With pleasure, I will prepare that right away.", "Of course. Would you like milk or sugar?"],
      suggestion: "Ich hätte gern einen Kaffee, bitte.",
      explanation: "Ich hätte gern is a friendly and natural ordering phrase.",
      vocabulary: { term: "ich hätte gern", translation: "I would like", example: "Ich hätte gern einen Kaffee." },
    },
    introductions: {
      reply: ["Freut mich! Schön, dich kennenzulernen.", "Wie schön! Was machst du gern?"],
      translation: ["Nice to meet you! Nice to get to know you.", "How nice! What do you like to do?"],
      suggestion: "Ich heiße Alex. Freut mich.",
      explanation: "Ich heiße is the most direct everyday introduction.",
      vocabulary: { term: "freut mich", translation: "nice to meet you", example: "Freut mich, dich kennenzulernen." },
    },
    directions: {
      reply: ["Der Bahnhof ist zwei Straßen von hier entfernt.", "Nein, er ist ganz nah. Sie können zu Fuß gehen."],
      translation: ["The station is two streets away from here.", "No, it is very close. You can walk."],
      suggestion: "Wo ist der Bahnhof?",
      explanation: "Wo ist is an essential question pattern for directions.",
      vocabulary: { term: "der Bahnhof", translation: "the station", example: "Wo ist der Bahnhof?" },
    },
    hotel: {
      reply: ["Ja, ich finde sie. Ihr Zimmer ist bereit.", "Frühstück gibt es von sieben bis zehn Uhr."],
      translation: ["Yes, I can find it. Your room is ready.", "Breakfast is from seven until ten."],
      suggestion: "Ich habe eine Reservierung auf Alex.",
      explanation: "Auf plus a name is commonly used for a reservation in conversation.",
      vocabulary: { term: "die Reservierung", translation: "the reservation", example: "Ich habe eine Reservierung." },
    },
  },
  japanese: {
    cafe: {
      reply: ["かしこまりました。すぐにお作りします。", "はい。ミルクか砂糖はいかがですか。"],
      translation: ["Certainly. I will make it right away.", "Yes. Would you like milk or sugar?"],
      suggestion: "コーヒーをください。",
      explanation: "ください is a clear, polite way to ask for an item.",
      vocabulary: { term: "ください", translation: "please give me", example: "コーヒーをください。" },
    },
    introductions: {
      reply: ["はじめまして。お会いできてうれしいです。", "いいですね。何をするのが好きですか。"],
      translation: ["Nice to meet you. I am happy to meet you.", "That is nice. What do you like to do?"],
      suggestion: "アレックスです。はじめまして。",
      explanation: "Name plus です is a simple, polite self-introduction.",
      vocabulary: { term: "はじめまして", translation: "nice to meet you", example: "はじめまして。アレックスです。" },
    },
    directions: {
      reply: ["駅はここから二つ目の角を右です。", "いいえ、近いです。歩いて行けます。"],
      translation: ["The station is right at the second corner from here.", "No, it is close. You can walk there."],
      suggestion: "駅はどこですか。",
      explanation: "Place plus はどこですか is a dependable location question.",
      vocabulary: { term: "駅", translation: "station", example: "駅はどこですか。" },
    },
    hotel: {
      reply: ["はい、確認できました。お部屋の準備ができています。", "朝食は七時から十時までです。"],
      translation: ["Yes, I have confirmed it. Your room is ready.", "Breakfast is from seven until ten."],
      suggestion: "アレックスの名前で予約しています。",
      explanation: "名前で予約しています states the name attached to a reservation.",
      vocabulary: { term: "予約", translation: "reservation", example: "予約しています。" },
    },
  },
};

export function getLanguageLabel(language: TargetLanguage): string {
  return LANGUAGE_LABELS[language];
}

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0];
}

export function getStarterVocabulary(language: TargetLanguage, now = new Date()): VocabularyWord[] {
  return STARTER_WORDS[language].map((word, index) => ({
    ...word,
    id: `starter-${language}-${index}`,
    language,
    source: "starter",
    createdAt: now.toISOString(),
    nextReviewAt: now.toISOString(),
    correctCount: 0,
    reviewIntervalDays: 0,
    easeFactor: 2.3,
    reviewCount: 0,
    lapseCount: 0,
  }));
}

function adaptiveTutorGuidance(level: LearningLevel): string {
  const guidance: Record<LearningLevel, string> = {
    starter: "Keep it short and complete—one clear phrase is enough right now.",
    beginner: "Use the phrase once, then try changing one detail to make it yours.",
    intermediate: "After this phrase, add a reason, preference, or follow-up question.",
    advanced: "Try a more personal follow-up and vary the wording naturally.",
  };
  return guidance[level];
}

export function createTutorTurn(
  language: TargetLanguage,
  scenarioId: ScenarioId,
  learnerMessage: string,
  turnNumber: number,
  level: LearningLevel = "beginner"
): TutorTurn {
  const phrase = TUTOR_PHRASES[language][scenarioId];
  const normalized = learnerMessage.trim().toLowerCase();
  const hasVeryShortReply = normalized.length < 5;
  const hasQuestion = /[?？]/.test(learnerMessage);
  const responseIndex = hasQuestion || turnNumber % 2 === 1 ? 1 : 0;

  return {
    reply: hasVeryShortReply
      ? `${phrase.reply[0]} ${phrase.suggestion}`
      : phrase.reply[responseIndex],
    translation: hasVeryShortReply
      ? `Try a complete phrase: ${phrase.suggestion}`
      : phrase.translation[responseIndex],
    correction: {
      label: hasVeryShortReply ? "Make it a full phrase" : "A more natural option",
      suggestion: phrase.suggestion,
      explanation: `${phrase.explanation} ${adaptiveTutorGuidance(level)}`,
    },
    vocabulary: phrase.vocabulary,
  };
}
