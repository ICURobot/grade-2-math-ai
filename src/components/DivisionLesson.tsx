/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DivisionLessonProps {
  onStartPractice: () => void;
}

const LESSON_STEPS = [
  {
    title: '1) Division means equal sharing',
    explanation: 'Division asks us to split a total into equal groups. If we share 12 candies into groups of 3, we are asking how many groups we can make.'
  },
  {
    title: '2) Count equal groups',
    explanation: 'Keep placing 3 in each group: 3, 6, 9, 12. We made 4 groups, so 12 ÷ 3 = 4.'
  },
  {
    title: '3) Check with multiplication',
    explanation: 'Division and multiplication are partner operations. If 12 ÷ 3 = 4, then 4 × 3 = 12. This helps us verify the answer.'
  }
];

export const DivisionLesson: React.FC<DivisionLessonProps> = ({ onStartPractice }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const lesson = LESSON_STEPS[stepIndex];
  const groups = useMemo(() => Array.from({ length: 4 }, () => Array.from({ length: 3 })), []);

  return (
    <div className="mb-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500">Interactive Division Lesson</p>
      <h3 className="mb-3 text-lg font-black text-cyan-900">{lesson.title}</h3>

      <AnimatePresence mode="wait">
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-4 text-sm leading-relaxed text-cyan-800"
        >
          {lesson.explanation}
        </motion.p>
      </AnimatePresence>

      <div className="mb-4 rounded-2xl border border-cyan-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-cyan-600">
          <span>Example: 12 ÷ 3</span>
          <span>{stepIndex === 2 ? 'Check' : 'Equal Groups'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {groups.map((group, gi) => (
            <div key={gi} className="rounded-xl border border-cyan-100 bg-cyan-50 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-500">Group {gi + 1}</p>
              <div className="mt-1 flex gap-1">
                {group.map((_, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: gi * 0.1 + ci * 0.08 }}
                    className="inline-block h-4 w-4 rounded-full bg-cyan-500"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <motion.p
          key={`equation-${stepIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-sm font-black text-cyan-800"
        >
          {stepIndex === 2 ? '4 × 3 = 12 ✅' : '12 ÷ 3 = 4'}
        </motion.p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
          disabled={stepIndex === 0}
          className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-bold text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <div className="text-[11px] font-bold text-cyan-700">Step {stepIndex + 1} of {LESSON_STEPS.length}</div>
        {stepIndex < LESSON_STEPS.length - 1 ? (
          <button
            onClick={() => setStepIndex(prev => Math.min(LESSON_STEPS.length - 1, prev + 1))}
            className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onStartPractice}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white"
          >
            Start Practice
          </button>
        )}
      </div>
    </div>
  );
};
