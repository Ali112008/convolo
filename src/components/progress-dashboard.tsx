"use client";

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  Footprints,
  MessageCircleMore,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SCENARIOS, getLanguageLabel } from "@/lib/catalog";
import { getDayKeyForOffset, relativeDayLabel } from "@/lib/learning-utils";
import { useLearning } from "./learning-provider";

export function ProgressDashboard() {
  const { data, stats } = useLearning();
  const profile = data.profile;
  if (!profile) return null;

  const week = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 6;
    const activity = data.dailyActivity[getDayKeyForOffset(offset)] ?? { xp: 0, minutes: 0, turns: 0 };
    return { offset, label: relativeDayLabel(offset), ...activity };
  });
  const totalWeekMinutes = week.reduce((sum, day) => sum + day.minutes, 0);
  const totalWeekTurns = week.reduce((sum, day) => sum + day.turns, 0);
  const maxWeekMinutes = Math.max(profile.dailyGoal, ...week.map((day) => day.minutes), 1);
  const completedScenarioIds = new Set(
    data.conversations
      .filter((conversation) => conversation.completedAt)
      .map((conversation) => conversation.scenarioId)
  );
  const completedScenarioCount = completedScenarioIds.size;
  const targetLanguage = getLanguageLabel(profile.targetLanguage);
  const xpMilestone = Math.ceil((stats.totalXp + 1) / 100) * 100;
  const xpRemaining = xpMilestone - stats.totalXp;
  const goalCompletionPercent = Math.min(100, Math.round((stats.todayMinutes / profile.dailyGoal) * 100));

  return (
    <div className="workspace-section progress-page">
      <section className="page-title-row">
        <div>
          <span className="section-label">YOUR LEARNING HISTORY</span>
          <h1>Progress you can actually feel.</h1>
          <p>Each guided reply and vocabulary review builds a visible record of your {targetLanguage} habit.</p>
        </div>
        <Link className="button button-primary" href="/app/practice">
          <MessageCircleMore size={18} /> Practice now
        </Link>
      </section>

      <section className="progress-stat-grid">
        <article className="progress-stat-card">
          <span className="progress-stat-icon stat-purple"><Flame size={21} /></span>
          <div><span>Current streak</span><strong>{stats.streak} day{stats.streak === 1 ? "" : "s"}</strong><small>Consecutive days with practice</small></div>
        </article>
        <article className="progress-stat-card">
          <span className="progress-stat-icon stat-blue"><Clock3 size={21} /></span>
          <div><span>Time invested</span><strong>{stats.totalMinutes} min</strong><small>{totalWeekMinutes} minutes in the last 7 days</small></div>
        </article>
        <article className="progress-stat-card">
          <span className="progress-stat-icon stat-gold"><Zap size={21} /></span>
          <div><span>Conversation momentum</span><strong>{stats.totalXp} XP</strong><small>{stats.totalTurns} practice turns completed</small></div>
        </article>
        <article className="progress-stat-card">
          <span className="progress-stat-icon stat-mint"><BookOpenCheck size={21} /></span>
          <div><span>Words revisited</span><strong>{stats.wordsLearned}</strong><small>Saved vocabulary reviewed</small></div>
        </article>
      </section>

      <section className="progress-main-grid">
        <article className="panel-card progress-chart-card">
          <div className="panel-heading">
            <div><span className="card-kicker">THIS WEEK</span><h2>Your practice rhythm</h2></div>
            <span className="week-total"><Clock3 size={15} /> {totalWeekMinutes} min</span>
          </div>
          <div className="detailed-bar-chart" aria-label="Minutes practiced for the last seven days">
            <div className="chart-guide chart-guide-top"><span>{maxWeekMinutes} min</span></div>
            <div className="chart-guide chart-guide-middle" />
            <div className="chart-guide chart-guide-bottom"><span>0</span></div>
            <div className="chart-bars">
              {week.map((day) => {
                const height = Math.max(day.minutes ? 11 : 3, (day.minutes / maxWeekMinutes) * 100);
                return (
                  <div className="detailed-bar-item" key={day.offset}>
                    <span className="detailed-bar-value">{day.minutes || "–"}</span>
                    <div className={`detailed-bar ${day.offset === 0 ? "today-bar" : ""}`} style={{ height: `${height}%` }} />
                    <span>{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart-caption"><Footprints size={16} /> {totalWeekTurns ? `${totalWeekTurns} tutor turns this week` : "Your first tutor turn will appear here."}</div>
        </article>

        <article className="panel-card today-progress-card">
          <div className="panel-heading"><div><span className="card-kicker">TODAY&apos;S PROMISE</span><h2>Daily goal</h2></div><Target size={20} /></div>
          <div className="goal-metric"><strong>{stats.todayMinutes}</strong><span>/ {profile.dailyGoal} min</span></div>
          <div className="wide-progress-track"><i style={{ width: `${goalCompletionPercent}%` }} /></div>
          <p>{goalCompletionPercent >= 100 ? "You kept today’s promise to yourself." : `${Math.max(0, profile.dailyGoal - stats.todayMinutes)} minutes will complete today’s goal.`}</p>
          <Link className="button button-secondary button-full" href="/app/practice">Add a conversation <ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="progress-main-grid lower-progress-grid">
        <article className="panel-card journey-card">
          <div className="panel-heading"><div><span className="card-kicker">LEARNING JOURNEY</span><h2>Scenario path</h2></div><CalendarCheck2 size={20} /></div>
          <div className="scenario-progress-list">
            {SCENARIOS.map((scenario, index) => {
              const done = completedScenarioIds.has(scenario.id);
              return (
                <div className={`journey-row ${done ? "journey-complete" : ""}`} key={scenario.id}>
                  <span className="journey-number">{done ? <CheckCircle2 size={16} /> : String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{scenario.title}</strong><small>{scenario.skill} · {scenario.duration}</small></div>
                  <span>{done ? "Completed" : "Ready"}</span>
                </div>
              );
            })}
          </div>
          <p className="journey-footer"><Trophy size={16} /> {completedScenarioCount} of {SCENARIOS.length} different scenes completed</p>
        </article>

        <article className="panel-card milestone-card">
          <div className="panel-heading"><div><span className="card-kicker">NEXT MILESTONE</span><h2>Keep the signal strong</h2></div><Award size={20} /></div>
          <div className="milestone-orbit"><span><Zap size={23} /></span></div>
          <strong>{xpRemaining} XP to {xpMilestone} XP</strong>
          <p>One thoughtful reply adds 12 XP. Review a word to keep the momentum going, too.</p>
          <div className="milestone-progress"><i style={{ width: `${Math.min(100, (stats.totalXp / xpMilestone) * 100)}%` }} /></div>
        </article>
      </section>

      <section className="progress-note-card">
        <BarChart3 size={19} />
        <p><strong>Local progress, clear meaning.</strong> This dashboard counts only actions completed in this browser: tutor turns, vocabulary reviews, and scenario finishes. Export your data anytime from Settings.</p>
      </section>
    </div>
  );
}
