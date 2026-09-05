import type { ReviewRating, VocabularyWord } from "./types";

const MIN_EASE = 1.3;
const MAX_EASE = 3.2;
const DEFAULT_EASE = 2.3;
const MAX_INTERVAL_DAYS = 3_650;
const TEN_MINUTES = 10 * 60 * 1_000;

export type ReviewStage = "new" | "learning" | "review" | "mastered";

export interface NextReviewSchedule {
  nextReviewAt: string;
  reviewIntervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lapseCount: number;
  correctCount: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function futureDate(from: Date, days: number): Date {
  const date = new Date(from);
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * A small, deterministic SM-2-inspired scheduler. It deliberately keeps the
 * state on the word itself, so local backups and cloud snapshots have the same
 * queue without relying on a server-side algorithm.
 */
export function scheduleVocabularyReview(
  word: VocabularyWord,
  rating: ReviewRating,
  reviewedAt = new Date()
): NextReviewSchedule {
  const priorInterval = clamp(Math.round(word.reviewIntervalDays || 0), 0, MAX_INTERVAL_DAYS);
  const priorEase = clamp(word.easeFactor || DEFAULT_EASE, MIN_EASE, MAX_EASE);
  const priorReviewCount = Math.max(0, Math.round(word.reviewCount || 0));
  const priorLapseCount = Math.max(0, Math.round(word.lapseCount || 0));
  const priorCorrectCount = Math.max(0, Math.round(word.correctCount || 0));

  if (rating === "again") {
    return {
      nextReviewAt: new Date(reviewedAt.getTime() + TEN_MINUTES).toISOString(),
      reviewIntervalDays: 0,
      easeFactor: roundToTwoDecimals(clamp(priorEase - 0.2, MIN_EASE, MAX_EASE)),
      reviewCount: priorReviewCount + 1,
      lapseCount: priorLapseCount + 1,
      correctCount: priorCorrectCount,
    };
  }

  const isFirstSuccessfulRecall = priorInterval === 0;
  let interval: number;
  let ease = priorEase;

  if (rating === "hard") {
    ease = clamp(priorEase - 0.15, MIN_EASE, MAX_EASE);
    interval = isFirstSuccessfulRecall ? 1 : Math.max(1, Math.round(priorInterval * 1.2));
  } else if (rating === "easy") {
    ease = clamp(priorEase + 0.15, MIN_EASE, MAX_EASE);
    interval = isFirstSuccessfulRecall
      ? 4
      : Math.max(2, Math.round(priorInterval * (ease + 0.15) * 1.3));
  } else {
    interval = isFirstSuccessfulRecall
      ? 1
      : priorInterval === 1
        ? 3
        : Math.max(2, Math.round(priorInterval * ease));
  }

  interval = clamp(interval, 1, MAX_INTERVAL_DAYS);
  return {
    nextReviewAt: futureDate(reviewedAt, interval).toISOString(),
    reviewIntervalDays: interval,
    easeFactor: roundToTwoDecimals(ease),
    reviewCount: priorReviewCount + 1,
    lapseCount: priorLapseCount,
    correctCount: priorCorrectCount + 1,
  };
}

export function isWordDue(word: VocabularyWord, now: number): boolean {
  return new Date(word.nextReviewAt).getTime() <= now;
}

export function getReviewStage(word: VocabularyWord): ReviewStage {
  if (word.reviewCount === 0) return "new";
  if (word.reviewIntervalDays <= 3) return "learning";
  if (word.reviewIntervalDays >= 21 && word.correctCount >= 4) return "mastered";
  return "review";
}

/** Sorts overdue cards by urgency, then puts fragile cards ahead of mature ones. */
export function sortReviewQueue(words: VocabularyWord[], now: number): VocabularyWord[] {
  return [...words]
    .filter((word) => isWordDue(word, now))
    .sort((left, right) => {
      const dueDifference = new Date(left.nextReviewAt).getTime() - new Date(right.nextReviewAt).getTime();
      if (dueDifference !== 0) return dueDifference;
      if (left.lapseCount !== right.lapseCount) return right.lapseCount - left.lapseCount;
      if (left.reviewIntervalDays !== right.reviewIntervalDays) {
        return left.reviewIntervalDays - right.reviewIntervalDays;
      }
      return left.term.localeCompare(right.term);
    });
}

export function reviewIntervalLabel(word: VocabularyWord): string {
  if (word.reviewIntervalDays === 0) return "again in 10 min";
  if (word.reviewIntervalDays === 1) return "next review tomorrow";
  return `next review in ${word.reviewIntervalDays} days`;
}
