"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Flame,
  Languages,
  MessageCircleMore,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SCENARIOS, getLanguageLabel, getScenario } from "@/lib/catalog";
import { getDayKeyForOffset, relativeDayLabel, shortDate } from "@/lib/learning-utils";
import { useLearning } from "./learning-provider";

const achievements = [
  { id: "first-turn", title: "First words", description: "Complete your first tutor turn", icon: MessageCircleMore },
  { id: "first-conversation", title: "Conversation starter", description: "Finish a guided scenario", icon: Trophy },
  { id: "word-collector", title: "Word collector", description: "Build a five-word review queue", icon: BookOpenCheck },
];

export function DashboardOverview() {
  const { data, now, stats } = useLearning();
  const profile = data.profile;

  if (!profile) return null;

  const targetLanguage = getLanguageLabel(profile.targetLanguage);
  const completedScenarioIds = new Set(
    data.conversations.filter((conversation) => conversation.completedAt).map((conversation) => conversation.scenarioId)
  );
  const nextScenario = SCENARIOS.find((scenario) => !completedScenarioIds.has(scenario.id)) ?? SCENARIOS[0];
  const dueWords = data.vocabulary.filter(
    (word) => new Date(word.nextReviewAt).getTime() <= now
  );
  const goalPercent = Math.min(100, Math.round((stats.todayMinutes / profile.dailyGoal) * 100));
  const goalRemaining = Math.max(0, profile.dailyGoal - stats.todayMinutes);
  const week = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 6;
    const activity = data.dailyActivity[getDayKeyForOffset(offset)];
    return {
      offset,
      label: relativeDayLabel(offset),
      minutes: activity?.minutes ?? 0,
    };
  });
  const maxMinutes = Math.max(profile.dailyGoal, ...week.map((day) => day.minutes), 1);
  const recentConversations = data.conversations.slice(0, 3);
  const nextContent = nextScenario.languageContent[profile.targetLanguage];

  return (
    <div className="workspace-section overview-page">
      <section className="overview-welcome">
        <div>
          <span className="section-label">YOUR LEARNING SPACE</span>
          <h1>Welcome back, {profile.name}.</h1>
          <p>
            Your {targetLanguage} practice is waiting. One clear sentence is enough to keep the habit moving.
          </p>
        </div>
        <div className="overview-language-chip">
          <Languages size={18} />
          <span>
            <small>FOCUS LANGUAGE</small>
            <strong>{targetLanguage}</strong>
          </span>
        </div>
      </section>

      <section className="today-grid">
        <article className="daily-goal-card">
          <div className="card-heading-row">
            <span className="card-kicker"><Target size={16} /> TODAY&apos;S GOAL</span>
            <span className="goal-status">{goalPercent}%</span>
          </div>
          <div className="goal-body">
            <div className="large-progress-ring" style={{ "--progress": `${goalPercent * 3.6}deg` } as CSSProperties}>
              <div>
                <strong>{stats.todayMinutes}</strong>
                <span>min</span>
              </div>
            </div>
            <div>
              <h2>{goalRemaining > 0 ? `${goalRemaining} minutes to your goal` : "Goal complete — beautiful work."}</h2>
              <p>{stats.todayTurns} guided turn{stats.todayTurns === 1 ? "" : "s"} completed today.</p>
              <div className="progress-track goal-track"><i style={{ width: `${goalPercent}%` }} /></div>
            </div>
          </div>
        </article>

        <article className="streak-card">
          <div className="streak-icon"><Flame size={24} /></div>
          <span className="card-kicker">CURRENT STREAK</span>
          <strong>{stats.streak}</strong>
          <span className="streak-unit">day{stats.streak === 1 ? "" : "s"}</span>
          <p>Keep a tiny promise to yourself today.</p>
        </article>

        <article className="xp-card">
          <div className="xp-icon"><Zap size={22} /></div>
          <span className="card-kicker">TOTAL MOMENTUM</span>
          <strong>{stats.totalXp}</strong>
          <span className="streak-unit">XP earned</span>
          <p>{stats.completedConversations} scenario{stats.completedConversations === 1 ? "" : "s"} completed</p>
        </article>
      </section>

      <section className="next-practice-card">
        <div className="next-practice-pattern" aria-hidden="true" />
        <div className="next-practice-copy">
          <span className="card-kicker"><Sparkles size={16} /> NEXT CONVERSATION</span>
          <h2>{nextScenario.title}</h2>
          <p>{nextScenario.description}</p>
          <div className="practice-meta-row">
            <span><Clock3 size={15} /> {nextScenario.duration}</span>
            <span><Coffee size={15} /> {nextScenario.skill}</span>
          </div>
          <Link className="button button-light" href="/app/practice">
            Start this practice <ArrowRight size={17} />
          </Link>
        </div>
        <div className="next-practice-preview">
          <span>{targetLanguage.toUpperCase()}</span>
          <p>{nextContent.opening}</p>
          <small>{nextContent.openingTranslation}</small>
        </div>
      </section>

      <section className="overview-lower-grid">
        <article className="panel-card weekly-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">WEEKLY RHYTHM</span>
              <h2>Practice minutes</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="bar-chart" aria-label="Practice minutes during the last seven days">
            {week.map((day) => {
              const height = Math.max(day.minutes ? 16 : 4, (day.minutes / maxMinutes) * 100);
              return (
                <div className="bar-item" key={day.offset}>
                  <div className="bar-value">{day.minutes || "–"}</div>
                  <div className="bar-track"><i style={{ height: `${height}%` }} /></div>
                  <span>{day.label}</span>
                </div>
              );
            })}
          </div>
          <Link className="inline-link" href="/app/progress">See detailed progress <ArrowRight size={15} /></Link>
        </article>

        <article className="panel-card review-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">VOCABULARY REVIEW</span>
              <h2>{dueWords.length ? `${dueWords.length} word${dueWords.length === 1 ? "" : "s"} ready` : "Queue is clear"}</h2>
            </div>
            <BookOpenCheck size={20} />
          </div>
          {dueWords.length > 0 ? (
            <>
              <div className="due-word-preview">
                <span>{dueWords[0].term}</span>
                <small>{dueWords[0].translation}</small>
              </div>
              <p>Give one minute to the phrases your future self will need.</p>
              <Link className="button button-secondary button-full" href="/app/vocabulary">Review vocabulary <ArrowRight size={16} /></Link>
            </>
          ) : (
            <>
              <div className="queue-clear-icon"><CheckCircle2 size={26} /></div>
              <p>Practice a scenario to collect useful phrases for your next review.</p>
              <Link className="button button-secondary button-full" href="/app/practice">Start practicing <ArrowRight size={16} /></Link>
            </>
          )}
        </article>
      </section>

      <section className="overview-lower-grid activity-grid">
        <article className="panel-card activity-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">RECENT ACTIVITY</span>
              <h2>Your conversation trail</h2>
            </div>
            <Link className="panel-link" href="/app/practice">Practice</Link>
          </div>
          {recentConversations.length ? (
            <ul className="activity-list">
              {recentConversations.map((conversation) => {
                const scenario = getScenario(conversation.scenarioId);
                return (
                  <li key={conversation.id}>
                    <span className="activity-icon"><MessageCircleMore size={17} /></span>
                    <span className="activity-copy">
                      <strong>{scenario.title}</strong>
                      <small>{conversation.completedAt ? "Completed" : "In progress"} · {shortDate(conversation.startedAt)}</small>
                    </span>
                    <span className="activity-xp">+{conversation.xpEarned} XP</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-mini-state">
              <MessageCircleMore size={21} />
              <p>Your completed conversations will appear here.</p>
            </div>
          )}
        </article>

        <article className="panel-card achievement-card">
          <div className="panel-heading">
            <div>
              <span className="card-kicker">MILESTONES</span>
              <h2>Little wins count</h2>
            </div>
            <Trophy size={20} />
          </div>
          <div className="achievement-list">
            {achievements.map(({ id, title, description, icon: Icon }) => {
              const unlocked = data.completedAchievementIds.includes(id);
              return (
                <div className={`achievement-row ${unlocked ? "achievement-unlocked" : ""}`} key={id}>
                  <span><Icon size={17} /></span>
                  <div><strong>{title}</strong><small>{description}</small></div>
                  {unlocked && <CheckCircle2 size={17} />}
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
