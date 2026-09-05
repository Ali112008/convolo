"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleStop,
  Coffee,
  Hotel,
  Languages,
  Lightbulb,
  MapPinned,
  MessageCircleMore,
  Play,
  SendHorizontal,
  Sparkles,
  UsersRound,
  Volume2,
  WandSparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SCENARIOS, createTutorTurn, getLanguageLabel, getScenario } from "@/lib/catalog";
import type { ConversationMessage, ScenarioId, TutorTurn } from "@/lib/types";
import { useLearning } from "./learning-provider";

const iconByScenario = {
  coffee: Coffee,
  users: UsersRound,
  map: MapPinned,
  hotel: Hotel,
};

const localeByLanguage = {
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  japanese: "ja-JP",
};

export function PracticeStudio() {
  const {
    data,
    startConversation,
    recordPracticeTurn,
    finishConversation,
    discardConversation,
  } = useLearning();
  const profile = data.profile;
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>("cafe");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [lastFeedback, setLastFeedback] = useState<TutorTurn | null>(null);
  const [confirmingDraftDiscard, setConfirmingDraftDiscard] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConversation = useMemo(
    () => data.conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, data.conversations]
  );
  const selectedScenario = getScenario(selectedScenarioId);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!profile) return null;

  const language = profile.targetLanguage;
  const languageName = getLanguageLabel(language);
  const selectedDraft = data.conversations.find(
    (conversation) =>
      !conversation.completedAt &&
      conversation.language === language &&
      conversation.scenarioId === selectedScenarioId
  );
  const selectedDraftResponses = selectedDraft?.messages.filter(
    (message) => message.role === "learner"
  ).length ?? 0;
  const scenarioContent = selectedScenario.languageContent[language];
  const activeScenario = activeConversation ? getScenario(activeConversation.scenarioId) : null;
  const activeContent = activeScenario?.languageContent[language];
  const sessionMessages: ConversationMessage[] = activeConversation
    ? [
        ...activeConversation.messages,
        ...(pendingText
          ? [
              {
                id: "pending-learner-message",
                role: "learner" as const,
                text: pendingText,
                createdAt: "pending",
              },
            ]
          : []),
      ]
    : [];

  function beginPractice() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = startConversation(selectedScenarioId);
    setActiveConversationId(id);
    setDraft("");
    setPendingText(null);
    setLastFeedback(null);
    setConfirmingDraftDiscard(false);
    setIsReplying(false);
  }

  function resumeDraft() {
    if (!selectedDraft) return;
    setActiveConversationId(selectedDraft.id);
    setDraft("");
    setPendingText(null);
    setLastFeedback(null);
    setConfirmingDraftDiscard(false);
  }

  function discardSelectedDraft() {
    if (!selectedDraft) return;
    discardConversation(selectedDraft.id);
    setConfirmingDraftDiscard(false);
    setDraft("");
    setPendingText(null);
    setLastFeedback(null);
  }

  function selectScenario(id: ScenarioId) {
    if (isReplying || activeConversation) return;
    setSelectedScenarioId(id);
    setLastFeedback(null);
    setConfirmingDraftDiscard(false);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation || !draft.trim() || isReplying || activeConversation.completedAt) return;

    const learnerText = draft.trim();
    const tutorTurn = createTutorTurn(
      language,
      activeConversation.scenarioId,
      learnerText,
      activeConversation.messages.filter((message) => message.role === "learner").length
    );
    setDraft("");
    setPendingText(learnerText);
    setIsReplying(true);

    timerRef.current = setTimeout(() => {
      recordPracticeTurn({
        conversationId: activeConversation.id,
        learnerText,
        tutorTurn,
      });
      setLastFeedback(tutorTurn);
      setPendingText(null);
      setIsReplying(false);
      timerRef.current = null;
    }, 650);
  }

  function endPractice() {
    if (!activeConversation || isReplying) return;
    finishConversation(activeConversation.id);
  }

  function resetSession() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveConversationId(null);
    setDraft("");
    setPendingText(null);
    setLastFeedback(null);
    setConfirmingDraftDiscard(false);
    setIsReplying(false);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeByLanguage[language];
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="workspace-section practice-page">
      <section className="page-title-row">
        <div>
          <span className="section-label">GUIDED CONVERSATIONS</span>
          <h1>Practice with purpose.</h1>
          <p>Choose a situation, respond in {languageName}, and pick up a more natural phrase after each turn.</p>
        </div>
        <div className="tutor-mode-badge"><Sparkles size={16} /> Local guided tutor</div>
      </section>

      <div className="practice-layout">
        <aside className="scenario-sidebar">
          <div className="scenario-sidebar-heading">
            <div>
              <span className="card-kicker">PICK A SCENE</span>
              <h2>Today&apos;s situations</h2>
            </div>
            <span>{languageName}</span>
          </div>
          <div className="scenario-list">
            {SCENARIOS.map((scenario) => {
              const Icon = iconByScenario[scenario.icon];
              const selected = scenario.id === selectedScenarioId;
              const hasCompleted = data.conversations.some(
                (conversation) =>
                  conversation.language === language &&
                  conversation.scenarioId === scenario.id &&
                  conversation.completedAt
              );
              return (
                <button
                  type="button"
                  className={`scenario-option ${selected ? "scenario-selected" : ""}`}
                  key={scenario.id}
                  onClick={() => selectScenario(scenario.id)}
                  disabled={isReplying || Boolean(activeConversation)}
                >
                  <span className="scenario-icon"><Icon size={19} /></span>
                  <span className="scenario-option-copy">
                    <strong>{scenario.title}</strong>
                    <small>{scenario.duration} · {scenario.skill}</small>
                  </span>
                  {hasCompleted && <CheckCircle2 className="scenario-complete" size={17} />}
                </button>
              );
            })}
          </div>
          <div className="scenario-tip">
            <Lightbulb size={18} />
            <p>Use the quick reply chips if you need a starting point. Change the sentence to make it your own.</p>
          </div>
        </aside>

        <section className="conversation-panel">
          {!activeConversation && (
            <div className="practice-intro-state">
              <div className="intro-scene-icon">
                {(() => {
                  const Icon = iconByScenario[selectedScenario.icon];
                  return <Icon size={27} />;
                })()}
              </div>
              <span className="section-label">{languageName.toUpperCase()} · {selectedScenario.skill.toUpperCase()}</span>
              <h2>{selectedScenario.title}</h2>
              <p>{selectedScenario.description}</p>
              <div className="scenario-goal">
                <span>YOUR MISSION</span>
                <strong>{scenarioContent.goal}</strong>
              </div>
              <div className="practice-intro-quote">
                <MessageCircleMore size={18} />
                <div>
                  <p>{scenarioContent.opening}</p>
                  <small>{scenarioContent.openingTranslation}</small>
                </div>
              </div>
              {selectedDraft ? (
                <div className="draft-resume-area">
                  <div className="draft-resume-summary">
                    <span><MessageCircleMore size={16} /> SAVED DRAFT</span>
                    <p>
                      {selectedDraftResponses} response{selectedDraftResponses === 1 ? "" : "s"} saved in this scene.
                    </p>
                  </div>
                  <div className="draft-resume-actions">
                    <button className="button button-primary" type="button" onClick={resumeDraft}>
                      Resume saved draft <Play size={17} />
                    </button>
                    <button className="button button-ghost" type="button" onClick={() => setConfirmingDraftDiscard(true)}>
                      Start over
                    </button>
                  </div>
                  {confirmingDraftDiscard && (
                    <div className="draft-discard-confirmation">
                      <p>Discard this unfinished transcript? Your earned XP and practice time stay in your progress history.</p>
                      <div>
                        <button className="button button-ghost" type="button" onClick={() => setConfirmingDraftDiscard(false)}>Keep draft</button>
                        <button className="button button-danger" type="button" onClick={discardSelectedDraft}>Discard draft</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button className="button button-primary button-large" type="button" onClick={beginPractice}>
                  Start conversation <Play size={17} />
                </button>
              )}
              <span className="intro-footnote">Guidance is generated locally; it does not send your text to a server.</span>
            </div>
          )}

          {activeConversation && activeScenario && activeContent && (
            <div className="active-practice">
              <div className="conversation-toolbar">
                <button className="back-to-scenes" type="button" onClick={resetSession} disabled={isReplying}>
                  <ArrowLeft size={17} /> Scenes
                </button>
                <div>
                  <span>{languageName.toUpperCase()} · {activeScenario.skill.toUpperCase()}</span>
                  <strong>{activeScenario.title}</strong>
                </div>
                <button
                  className={`translation-toggle ${showTranslations ? "translation-on" : ""}`}
                  type="button"
                  onClick={() => setShowTranslations((visible) => !visible)}
                  aria-pressed={showTranslations}
                >
                  <Languages size={16} /> Translation
                </button>
              </div>

              {activeConversation.completedAt ? (
                <div className="practice-complete-state">
                  <span className="complete-burst"><CheckCircle2 size={35} /></span>
                  <span className="section-label">SCENE COMPLETE</span>
                  <h2>You showed up. That counts.</h2>
                  <p>
                    You earned {activeConversation.xpEarned} XP and practiced {Math.max(1, Math.floor(activeConversation.messages.length / 2))} response{Math.floor(activeConversation.messages.length / 2) === 1 ? "" : "s"}.
                  </p>
                  <div className="complete-actions">
                    <button className="button button-primary" type="button" onClick={resetSession}>
                      Pick another scene <ArrowRight size={17} />
                    </button>
                    <Link className="button button-secondary" href="/app/vocabulary">
                      Review saved words <BookOpenCheck size={17} />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="conversation-thread" aria-live="polite">
                    {sessionMessages.map((message, index) => (
                      <div
                        className={`chat-row ${message.role === "learner" ? "chat-row-learner" : "chat-row-tutor"}`}
                        key={message.id}
                      >
                        {message.role === "tutor" && <span className="tutor-avatar">L</span>}
                        <div className={`chat-bubble ${message.role === "learner" ? "learner-bubble" : "tutor-bubble"}`}>
                          {message.role === "tutor" && index === 0 && <span className="bubble-speaker">LUCÍA · TUTOR</span>}
                          <p>{message.text}</p>
                          {message.role === "tutor" && (
                            <button className="speak-button" type="button" onClick={() => speak(message.text)} aria-label="Hear this phrase">
                              <Volume2 size={14} /> Listen
                            </button>
                          )}
                          {showTranslations && message.translation && <small>{message.translation}</small>}
                        </div>
                      </div>
                    ))}
                    {isReplying && (
                      <div className="chat-row chat-row-tutor">
                        <span className="tutor-avatar">L</span>
                        <div className="typing-bubble" aria-label="Tutor is replying"><i /><i /><i /></div>
                      </div>
                    )}
                  </div>

                  {lastFeedback && !isReplying && (
                    <aside className="feedback-card">
                      <div className="feedback-title"><WandSparkles size={17} /> {lastFeedback.correction.label}</div>
                      <strong>{lastFeedback.correction.suggestion}</strong>
                      <p>{lastFeedback.correction.explanation}</p>
                      <div className="feedback-word"><BookOpenCheck size={15} /><span><b>{lastFeedback.vocabulary.term}</b> · {lastFeedback.vocabulary.translation}</span><span>Saved to vocabulary</span></div>
                    </aside>
                  )}

                  <div className="quick-replies" aria-label="Suggested replies">
                    {activeContent.quickReplies.map((reply) => (
                      <button key={reply} type="button" onClick={() => setDraft(reply)} disabled={isReplying}>
                        {reply}
                      </button>
                    ))}
                  </div>
                  <form className="message-composer" onSubmit={sendMessage}>
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={`Write a reply in ${languageName}…`}
                      aria-label={`Write a reply in ${languageName}`}
                      disabled={isReplying}
                      maxLength={280}
                    />
                    <button className="send-button" type="submit" disabled={!draft.trim() || isReplying} aria-label="Send reply">
                      <SendHorizontal size={19} />
                    </button>
                  </form>
                  <div className="conversation-footer">
                    <span><Zap size={15} /> +12 XP per response</span>
                    <button type="button" onClick={endPractice} disabled={isReplying}>
                      <CircleStop size={15} /> Finish scene
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
