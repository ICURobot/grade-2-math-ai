/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Star, TrendingUp, Calendar, Award, AlertTriangle, Target } from 'lucide-react';
import { getStats } from '../services/storageService';

export const Dashboard: React.FC = () => {
  const stats = getStats();

  const sortedSubskills = Object.entries(stats.subskillAccuracy)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);

  const commonMistakes = Object.entries(stats.mistakeTagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Parent Dashboard</h1>
        <p className="text-slate-500">Track your child's math journey</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <Star className="text-yellow-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">{stats.totalStars}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Stars</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <TrendingUp className="text-emerald-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">{stats.streak}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Day Streak</span>
        </div>
      </div>

      {sortedSubskills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target size={20} className="text-red-500" />
            Needs Practice
          </h2>
          <div className="space-y-3">
            {sortedSubskills.map(([skill, accuracy]) => (
              <div key={skill} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700 capitalize">{skill.replace(/-/g, ' ')}</span>
                  <span className="text-slate-900 font-bold">{accuracy}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    className={`h-full ${accuracy < 50 ? 'bg-red-500' : 'bg-orange-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {commonMistakes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Common Mistakes
          </h2>
          <div className="flex flex-wrap gap-2">
            {commonMistakes.map(([tag, count]) => (
              <div key={tag} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                {tag.replace(/_/g, ' ')} ({count})
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award size={20} className="text-indigo-500" />
          All Subskills
        </h2>
        <div className="space-y-4">
          {Object.entries(stats.subskillAccuracy).map(([skill, accuracy]) => (
            <div key={skill} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-slate-700 capitalize">{skill.replace(/-/g, ' ')}</span>
                <span className="text-slate-900 font-bold">{accuracy}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${accuracy}%` }}
                  className="bg-indigo-500 h-full"
                />
              </div>
            </div>
          ))}
          {Object.keys(stats.subskillAccuracy).length === 0 && (
            <p className="text-center text-slate-400 py-4 italic">Complete sessions to see accuracy data.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-500" />
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {stats.history.slice(-5).reverse().map((session, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800 capitalize">{session.skill}</p>
                <p className="text-xs text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">{session.correctCount} / {session.totalQuestions}</p>
                <p className="text-[10px] uppercase font-bold text-slate-300">{session.difficulty}</p>
              </div>
            </div>
          ))}
          {stats.history.length === 0 && (
            <p className="text-center text-slate-400 py-8 italic">No sessions yet. Start learning!</p>
          )}
        </div>
      </section>
    </div>
  );
};
