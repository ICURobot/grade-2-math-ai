/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserStats, SessionResult } from '../types';

const STORAGE_KEY = 'math_buddy_stats_v2';

const defaultStats: UserStats = {
  totalStars: 0,
  streak: 0,
  lastSessionDate: null,
  history: [],
  subskillAccuracy: {},
  mistakeTagCounts: {},
  gradePerformance: { grade2: { sessions: 0, stars: 0 }, grade3: { sessions: 0, stars: 0 } }
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultStats;
  try {
    const parsed = JSON.parse(stored);
    return {
      ...defaultStats,
      ...parsed,
      gradePerformance: { ...defaultStats.gradePerformance, ...(parsed.gradePerformance || {}) }
    };
  } catch {
    return defaultStats;
  }
};

export const saveSession = (result: SessionResult) => {
  const stats = getStats();
  
  // Update history
  stats.history.push(result);
  if (stats.history.length > 50) stats.history.shift();

  // Update stars
  stats.totalStars += result.correctCount;
  stats.gradePerformance[result.grade] = stats.gradePerformance[result.grade] || { sessions: 0, stars: 0 };
  stats.gradePerformance[result.grade].sessions += 1;
  stats.gradePerformance[result.grade].stars += result.correctCount;

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastSessionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (stats.lastSessionDate === yesterdayStr) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }
    stats.lastSessionDate = today;
  }

  // Update subskill accuracy (recalculate from last 20 history items per subskill)
  Object.entries(result.subskillStats).forEach(([subskill, _data]) => {
    const relevantSessions = stats.history
      .filter(h => h.subskillStats[subskill])
      .slice(-20);
    
    const totalQ = relevantSessions.reduce((acc, h) => acc + h.subskillStats[subskill].total, 0);
    const totalC = relevantSessions.reduce((acc, h) => acc + h.subskillStats[subskill].correct, 0);
    stats.subskillAccuracy[subskill] = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
  });

  // Update mistake tags
  result.mistakeTags.forEach(tag => {
    stats.mistakeTagCounts[tag] = (stats.mistakeTagCounts[tag] || 0) + 1;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};
