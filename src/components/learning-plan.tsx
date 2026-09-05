"use client";

import {
  ArrowRight,
  AudioLines,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  CircleCheckBig,
  ClipboardCheck,
  Headphones,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getLanguageLabel, getScenario } from "@/lib/catalog";
import {
  getAdaptiveRecommendation,
  getPlacementQuestions,
  recommendLevelFromPlacement,
} from "@/lib/placement";
import { useLearning } from "./learning-provider";
import { SpeechButton } from "./speech-button";

type PlanView = "overview" | "assessment" | "result";

export function LearningPlan() {
  const { data, now, activeStats, recordPlacement, updateProfile } = useLearning();
  const profile = data.profile;
  const [view, setView] = useState<PlanView>("overview");
  const [answers, setAnswers] = useState<number[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [recommendedLevel, setRecommendedLevel] = useState(profile?.level ?? "starter");
  const [appliedRecommendation, setAppliedRecommendation] = useState(false);

  if (!profile) return null;

  const language = profile.targetLanguage;
  const languageName = getLanguageLabel(language);
  const questions = getPlacementQuestions(language);
  const recommendation = getAdaptiveRecommendation(data, language, now);
  const latestPlacement = data.languagePreferences[language].placement;
  const audioScenario = getScenario(recommendation.scenarioId ?? "cafe");
  const audioPhrase = audioScenario.languageContent[language].opening;
  const answeredCount = answers.filter((answer) => answer >= 0).length;

  function startAssessment() {
    setAnswers(Array.from({ length: questions.length }, () => -1));
    setLatestScore(null);
    setAppliedRecommendation(false);
    setView("assessment");
  }

  function chooseAnswer(questionIndex: number, choiceIndex: number) {
    setAnswers((current) => {
      const next = current.length === questions.length
        ? [...current]
        : Array.from({ length: questions.length }, () => -1);
      next[questionIndex] = choiceIndex;
      return next;
    });
  }

  function finishAssessment() {
    if (answeredCount !== questions.length) return;
    const score = questions.reduce(
      (total, question, index) => total + (answers[index] === question.correctChoiceIndex ? 1 : 0),
      0
    );
    const nextLevel = recommendLevelFromPlacement(score, questions.length);
    recordPlacement({
      language,
      score,
      totalQuestions: questions.length,
      recommendedLevel: nextLevel,
    });
    setLatestScore(score);
    setRecommendedLevel(nextLevel);
    setView("result");
  }

  function applyRecommendation() {
    updateProfile({ level: recommendedLevel });
    setAppliedRecommendation(true);
  }

  return (
    <div className="workspace-section learning-plan-page">
      <section className="page-title-row">
        <div>
          <span className="section-label">ADAPTIVE LEARNING PLAN</span>
          <h1>Give every study minute a job.</h1>
          <p>
            Your plan uses your {languageName} placement result, review queue, and completed scenes.
            It changes your recommendation—not your saved level—unless you choose to apply it.
          </p>
        </div>
        <div className="plan-level-badge"><Target size={17} /> {profile.level} path</div>
      </section>

      {view === "overview" && (
        <>
          <section className="adaptive-hero-card">
            <div className="adaptive-hero-icon"><BrainCircuit size={27} /></div>
            <div className="adaptive-hero-copy">
              <span className="card-kicker">{recommendation.eyebrow}</span>
              <h2>{recommendation.title}</h2>
              <p>{recommendation.description}</p>
              <div className="adaptive-hero-meta">
                <span><Sparkles size={15} /> {activeStats.todayMinutes} min practiced today</span>
                <span><ClipboardCheck size={15} /> {latestPlacement ? `Last check: ${latestPlacement.score}/${latestPlacement.totalQuestions}` : "No placement result yet"}</span>
              </div>
            </div>
            {recommendation.href === "/app/plan" ? (
              <button className="button button-primary" type="button" onClick={startAssessment}>
                {recommendation.actionLabel} <ArrowRight size={17} />
              </button>
            ) : (
              <Link className="button button-primary" href={recommendation.href}>
                {recommendation.actionLabel} <ArrowRight size={17} />
              </Link>
            )}
          </section>

          <section className="plan-grid">
            <article className="placement-summary-card">
              <div className="plan-card-heading">
                <span className="plan-card-icon plan-card-icon-purple"><ClipboardCheck size={20} /></span>
                <div><span className="card-kicker">PLACEMENT CHECK</span><h2>Know where to begin.</h2></div>
              </div>
              {latestPlacement ? (
                <div className="placement-summary-result">
                  <strong>{latestPlacement.score} / {latestPlacement.totalQuestions}</strong>
                  <span>Recommended: <b>{latestPlacement.recommendedLevel}</b></span>
                  <small>Saved for {languageName}. Your current path stays {profile.level} until you choose otherwise.</small>
                </div>
              ) : (
                <p className="plan-card-copy">Six quick recognition and context questions give your plan a sensible starting signal.</p>
              )}
              <button className="button button-secondary" type="button" onClick={startAssessment}>
                {latestPlacement ? "Retake placement check" : "Start placement check"} <ArrowRight size={17} />
              </button>
            </article>

            <article className="audio-lab-card">
              <div className="plan-card-heading">
                <span className="plan-card-icon plan-card-icon-blue"><AudioLines size={20} /></span>
                <div><span className="card-kicker">AUDIO LAB · BETA</span><h2>Listen, then echo.</h2></div>
              </div>
              <p className="audio-lab-phrase">{audioPhrase}</p>
              <p className="plan-card-copy">Use your device voice at a calm pace, repeat it aloud, then use the phrase in your next scene. Audio remains on this device.</p>
              <div className="audio-lab-actions">
                <SpeechButton text={audioPhrase} language={language} label="Play slowly" className="button button-secondary" rate={0.72} />
                <Link className="button button-ghost" href="/app/practice"><Headphones size={17} /> Open practice</Link>
              </div>
            </article>
          </section>
        </>
      )}

      {view === "assessment" && (
        <section className="placement-assessment-card" aria-labelledby="placement-title">
          <div className="assessment-toolbar">
            <button className="back-to-list" type="button" onClick={() => setView("overview")}>
              <ChevronLeft size={17} /> Back to plan
            </button>
            <span>{answeredCount} of {questions.length} answered</span>
          </div>
          <div className="assessment-heading">
            <span className="section-label">{languageName.toUpperCase()} PLACEMENT CHECK</span>
            <h2 id="placement-title">Choose the answer that feels most natural.</h2>
            <p>This is a practical signal, not an exam. Your existing {languageName} level will not change automatically.</p>
          </div>
          <div className="placement-question-list">
            {questions.map((question, questionIndex) => (
              <fieldset className="placement-question" key={question.id}>
                <legend><span>{questionIndex + 1}</span>{question.skill}</legend>
                <strong>{question.prompt}</strong>
                <small>{question.helper}</small>
                <div className="placement-options">
                  {question.choices.map((choice, choiceIndex) => (
                    <label className={answers[questionIndex] === choiceIndex ? "placement-option-selected" : ""} key={choice}>
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[questionIndex] === choiceIndex}
                        onChange={() => chooseAnswer(questionIndex, choiceIndex)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="assessment-actions">
            <p>{answeredCount === questions.length ? "Ready to save a recommendation for this language path." : "Answer every question to see your recommendation."}</p>
            <button className="button button-primary" type="button" disabled={answeredCount !== questions.length} onClick={finishAssessment}>
              See my recommendation <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {view === "result" && latestScore !== null && (
        <section className="placement-result-card">
          <span className="placement-result-icon"><CircleCheckBig size={34} /></span>
          <span className="section-label">PLACEMENT SAVED FOR {languageName.toUpperCase()}</span>
          <h2>Your recommended starting point: {recommendedLevel}</h2>
          <p>You got {latestScore} of {questions.length} prompts. This recommendation is saved to this language path and stays separate from every other language you study.</p>
          <div className="placement-result-actions">
            {profile.level !== recommendedLevel ? (
              <button className="button button-primary" type="button" onClick={applyRecommendation} disabled={appliedRecommendation}>
                {appliedRecommendation ? <><CheckCircle2 size={17} /> Level applied</> : <>Use {recommendedLevel} for my {languageName} path <ArrowRight size={17} /></>}
              </button>
            ) : (
              <span className="placement-level-match"><CheckCircle2 size={17} /> Your current path already matches this recommendation.</span>
            )}
            <button className="button button-secondary" type="button" onClick={startAssessment}><RotateCcw size={17} /> Retake check</button>
            <button className="button button-ghost" type="button" onClick={() => setView("overview")}>Keep current level</button>
          </div>
        </section>
      )}
    </div>
  );
}
