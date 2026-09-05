"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Layers3,
  Lightbulb,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { getLanguageLabel } from "@/lib/catalog";
import { shortDate } from "@/lib/learning-utils";
import {
  getReviewStage,
  isWordDue,
  reviewIntervalLabel,
  sortReviewQueue,
} from "@/lib/review-scheduling";
import type { ReviewRating, VocabularyWord } from "@/lib/types";
import { useLearning } from "./learning-provider";
import { SpeechButton } from "./speech-button";

type Filter = "all" | "due" | "learned";

export function VocabularyBook() {
  const { data, addWord, reviewWord, now, activeStats } = useLearning();
  const profile = data.profile;
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [notes, setNotes] = useState("");

  if (!profile) return null;

  const words = data.vocabulary.filter((word) => word.language === profile.targetLanguage);
  const dueWords = sortReviewQueue(words, now);
  const normalizedQuery = query.trim().toLowerCase();
  const wordsToDisplay = words.filter((word) => {
    const matchesFilter =
      filter === "all" ||
        (filter === "due" && isWordDue(word, now)) ||
      (filter === "learned" && word.correctCount > 0);
    const matchesQuery =
      !normalizedQuery ||
      word.term.toLowerCase().includes(normalizedQuery) ||
      word.translation.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
  const reviewWordItem = dueWords[0];
  const languageName = getLanguageLabel(profile.targetLanguage);

  function rateWord(rating: ReviewRating) {
    if (!reviewWordItem) return;
    reviewWord(reviewWordItem.id, rating);
    setRevealed(false);
  }

  function submitNewWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term.trim() || !translation.trim()) return;
    addWord({ term, translation, example, notes });
    setTerm("");
    setTranslation("");
    setExample("");
    setNotes("");
    setShowAddWord(false);
  }

  return (
    <div className="workspace-section vocabulary-page">
      <section className="page-title-row">
        <div>
          <span className="section-label">PERSONAL VOCABULARY</span>
          <h1>Keep the phrases worth keeping.</h1>
          <p>Every useful word has a home, a context sentence, and a simple moment to return for review.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setShowAddWord(true)}>
          <CirclePlus size={18} /> Add a word
        </button>
      </section>

      <section className="vocabulary-summary-grid">
        <article className="vocabulary-summary-card">
          <span className="summary-icon summary-purple"><BookMarked size={20} /></span>
          <div><strong>{words.length}</strong><small>{languageName} words saved</small></div>
        </article>
        <article className="vocabulary-summary-card">
          <span className="summary-icon summary-gold"><RotateCcw size={20} /></span>
          <div><strong>{dueWords.length}</strong><small>ready to review now</small></div>
        </article>
        <article className="vocabulary-summary-card">
          <span className="summary-icon summary-mint"><CheckCircle2 size={20} /></span>
          <div><strong>{activeStats.wordsLearned}</strong><small>words reviewed successfully</small></div>
        </article>
      </section>

      {reviewing ? (
        <section className="review-session-card">
          <button className="back-to-list" type="button" onClick={() => { setReviewing(false); setRevealed(false); }}>
            <ArrowLeft size={17} /> Back to vocabulary
          </button>
          {reviewWordItem ? (
            <div className="review-card-content">
              <span className="section-label">REVIEW QUEUE · {dueWords.length} LEFT</span>
              <div className="review-word-card">
                <span className="review-language">{languageName.toUpperCase()} · {getReviewStage(reviewWordItem).toUpperCase()}</span>
                <div className="review-word-title-row">
                  <h2>{reviewWordItem.term}</h2>
                  <SpeechButton text={reviewWordItem.term} language={profile.targetLanguage} label="Hear" />
                </div>
                {revealed ? (
                  <div className="review-answer">
                    <strong>{reviewWordItem.translation}</strong>
                    <p>{reviewWordItem.example}</p>
                    {reviewWordItem.notes && <small>Note: {reviewWordItem.notes}</small>}
                  </div>
                ) : (
                  <button className="button button-secondary" type="button" onClick={() => setRevealed(true)}>
                    Show answer <ChevronDown size={17} />
                  </button>
                )}
              </div>
              {revealed && (
                <div className="review-ratings">
                  <p>How easily did this come back to you?</p>
                  <div>
                    <button type="button" className="rating-again" onClick={() => rateWord("again")}>Again <small>10 min</small></button>
                    <button type="button" className="rating-hard" onClick={() => rateWord("hard")}>Hard <small>short interval</small></button>
                    <button type="button" className="rating-good" onClick={() => rateWord("good")}>Good <small>smart interval</small></button>
                    <button type="button" className="rating-easy" onClick={() => rateWord("easy")}>Easy <small>longer interval</small></button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="review-empty">
              <span className="queue-clear-icon"><CheckCircle2 size={32} /></span>
              <h2>Your review queue is clear.</h2>
              <p>Return after your next practice session or add a word you want to remember.</p>
              <button className="button button-primary" type="button" onClick={() => setReviewing(false)}>Browse words</button>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="review-banner">
            <div className="review-banner-icon"><Sparkles size={21} /></div>
            <div>
              <span className="card-kicker">A SMALL WIN IS WAITING</span>
              <h2>{dueWords.length ? `${dueWords.length} word${dueWords.length === 1 ? "" : "s"} are ready for a quick review.` : "Your review queue is all caught up."}</h2>
              <p>{dueWords.length ? "A few focused recalls will help these phrases stick." : "Practice a new conversation to collect more useful language."}</p>
            </div>
            {dueWords.length > 0 ? (
              <button className="button button-light" type="button" onClick={() => setReviewing(true)}>
                Review now <ArrowRight size={17} />
              </button>
            ) : (
              <span className="queue-complete"><CheckCircle2 size={17} /> All clear</span>
            )}
          </section>

          <section className="word-library-panel">
            <div className="library-toolbar">
              <div className="filter-tabs" role="tablist" aria-label="Vocabulary filters">
                {(["all", "due", "learned"] as Filter[]).map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filter === item}
                    className={filter === item ? "filter-active" : ""}
                    key={item}
                    onClick={() => setFilter(item)}
                  >
                    {item === "all" ? "All words" : item === "due" ? `Due (${dueWords.length})` : "Reviewed"}
                  </button>
                ))}
              </div>
              <label className="search-field">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vocabulary" />
              </label>
            </div>

            {wordsToDisplay.length ? (
              <div className="word-grid">
                {wordsToDisplay.map((word) => <VocabularyWordCard word={word} now={now} key={word.id} />)}
              </div>
            ) : (
              <div className="empty-word-list">
                <Layers3 size={26} />
                <h2>No words match this view.</h2>
                <p>Try a different filter, search term, or add a phrase from your own life.</p>
              </div>
            )}
          </section>
        </>
      )}

      {showAddWord && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowAddWord(false)}>
          <section
            className="word-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-word-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div><span className="section-label">ADD TO YOUR BOOK</span><h2 id="add-word-title">Save a phrase you want to own.</h2></div>
              <button className="icon-button" type="button" onClick={() => setShowAddWord(false)} aria-label="Close add word form"><X size={19} /></button>
            </div>
            <form className="add-word-form" onSubmit={submitNewWord}>
              <label className="field-label" htmlFor="word-term">Word or phrase</label>
              <input className="text-input" id="word-term" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="e.g. hasta luego" maxLength={80} required />
              <label className="field-label" htmlFor="word-translation">Meaning</label>
              <input className="text-input" id="word-translation" value={translation} onChange={(event) => setTranslation(event.target.value)} placeholder="e.g. see you later" maxLength={100} required />
              <label className="field-label" htmlFor="word-example">Example sentence <small>optional</small></label>
              <input className="text-input" id="word-example" value={example} onChange={(event) => setExample(event.target.value)} placeholder="Use it in a phrase" maxLength={160} />
              <label className="field-label" htmlFor="word-notes">Personal note <small>optional</small></label>
              <textarea className="text-input" id="word-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="A reminder, pronunciation clue, or context" maxLength={240} rows={3} />
              <div className="modal-actions">
                <button className="button button-ghost" type="button" onClick={() => setShowAddWord(false)}>Cancel</button>
                <button className="button button-primary" type="submit">Save word <BookOpenCheck size={17} /></button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function VocabularyWordCard({ word, now }: { word: VocabularyWord; now: number }) {
  const isDue = isWordDue(word, now);
  const sourceLabel = word.source === "practice" ? "From a practice" : word.source === "manual" ? "Added by you" : "Starter phrase";
  const stage = getReviewStage(word);

  return (
    <article className="word-card">
      <div className="word-card-heading">
        <span className="word-source">{sourceLabel}</span>
        {isDue ? <span className="word-due">Due now</span> : <span className="word-reviewed">{reviewIntervalLabel(word)}</span>}
      </div>
      <div className="word-card-term-row">
        <h3>{word.term}</h3>
        <SpeechButton text={word.term} language={word.language} label="Hear" />
      </div>
      <strong>{word.translation}</strong>
      <p>{word.example}</p>
      <footer>
        <span>{word.lastReviewedAt ? `Last reviewed ${shortDate(word.lastReviewedAt)}` : "Not reviewed yet"}</span>
        <span className={`review-stage review-stage-${stage}`}>{stage}</span>
        {word.notes && <span title={word.notes}><Lightbulb size={15} /></span>}
      </footer>
    </article>
  );
}
