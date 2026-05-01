/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CoinsLessonProps {
  onStartPractice: () => void;
}

// All Canadian coins with authentic visual properties
const COINS = [
  { value: 1,   label: '1¢',  name: 'Penny',   icon: '🍁', bg: '#C47722', hl: '#E8A040', border: '#8B5610', sz: 44, textColor: '#fff9f0' },
  { value: 5,   label: '5¢',  name: 'Nickel',  icon: '🦫', bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', sz: 50, textColor: '#222' },
  { value: 10,  label: '10¢', name: 'Dime',    icon: '⛵', bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', sz: 40, textColor: '#222' },
  { value: 25,  label: '25¢', name: 'Quarter', icon: '🦌', bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', sz: 58, textColor: '#222' },
  { value: 100, label: '$1',  name: 'Loonie',  icon: '🦆', bg: '#C9A220', hl: '#EDD040', border: '#907010', sz: 64, textColor: '#3D2600' },
  { value: 200, label: '$2',  name: 'Toonie',  icon: '🐻', bg: '#C9A220', hl: '#EDD040', border: '#907010', sz: 68, textColor: '#222', isToonie: true as const },
] as const;

type CoinDef = typeof COINS[number];

function CanadianCoin({ coin, animate = false, delay = 0, showLabel = false }: {
  coin: CoinDef; animate?: boolean; delay?: number; showLabel?: boolean;
}) {
  const borderWidth = Math.max(2, Math.round(coin.sz * 0.05));
  const fontSize = coin.sz < 42 ? 9 : coin.sz < 52 ? 11 : 13;

  if ('isToonie' in coin && coin.isToonie) {
    return (
      <motion.div
        className="flex flex-col items-center"
        initial={animate ? { scale: 0, opacity: 0, rotate: -15 } : false}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay, type: 'spring', stiffness: 220, damping: 14 }}
      >
        <div style={{
          width: coin.sz, height: coin.sz, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${coin.hl}, ${coin.bg} 60%, #6A5000 100%)`,
          border: `${borderWidth}px solid ${coin.border}`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.35), inset 0 1px 4px rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Silver inner disk */}
          <div style={{
            width: coin.sz * 0.52, height: coin.sz * 0.52, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #E8E8E8, #ADADAD 60%, #686868 100%)',
            border: `2px solid #808080`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#333' }}>$2</span>
          </div>
        </div>
        {showLabel && (
          <div className="mt-1.5 text-center">
            <div style={{ fontSize: 14 }}>{coin.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#555' }}>{coin.name}</div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={animate ? { scale: 0, opacity: 0, rotate: -15 } : false}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 14 }}
    >
      <div style={{
        width: coin.sz, height: coin.sz, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${coin.hl}, ${coin.bg} 65%, ${coin.border} 100%)`,
        border: `${borderWidth}px solid ${coin.border}`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize, fontWeight: 900, color: coin.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
          {coin.label}
        </span>
      </div>
      {showLabel && (
        <div className="mt-1.5 text-center">
          <div style={{ fontSize: 14 }}>{coin.icon}</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#555' }}>{coin.name}</div>
        </div>
      )}
    </motion.div>
  );
}

// Worked example: 1 quarter + 1 dime + 2 nickels = 45¢
const EXAMPLE_COINS = [
  { ...COINS[3] }, // quarter 25¢
  { ...COINS[2] }, // dime 10¢
  { ...COINS[1] }, // nickel 5¢
  { ...COINS[1] }, // nickel 5¢
];
const EXAMPLE_STEPS = [
  { running: 25, label: '+ 25¢ quarter' },
  { running: 35, label: '+ 10¢ dime' },
  { running: 40, label: '+ 5¢ nickel' },
  { running: 45, label: '+ 5¢ nickel' },
];

const LESSON_STEPS = [
  {
    title: '1) Meet Canadian Coins!',
    desc: 'Canada has 6 coins. Each coin has a unique colour, size, and Canadian symbol on it. The dime is the smallest coin — but it is worth 10 cents!',
  },
  {
    title: '2) Small Coins: 1¢, 5¢, 10¢',
    desc: 'The penny (1¢) is copper-coloured 🍁. The nickel (5¢) is silver with a beaver 🦫. The dime (10¢) is the smallest silver coin, with a schooner ship ⛵.\n\nSkip-count nickels by 5s and dimes by 10s!',
  },
  {
    title: '3) Big Coins: 25¢, $1, $2',
    desc: 'The quarter (25¢) has a caribou 🦌. Four quarters make $1!\n\nThe loonie ($1) is gold with a loon bird 🦆. Two loonies make $2!\n\nThe toonie ($2) is special — it has a gold ring and a silver centre with a polar bear 🐻.',
  },
  {
    title: '4) Count from Biggest to Smallest!',
    desc: 'Always start with the largest coin, then add smaller coins one at a time. Watch how the total grows!',
  },
];

export const CoinsLesson: React.FC<CoinsLessonProps> = ({ onStartPractice }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [exampleStep, setExampleStep] = useState(0);

  const step = LESSON_STEPS[stepIndex];

  return (
    <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-600">
        Interactive Coins Lesson 🍁
      </p>
      <h3 className="mb-3 text-lg font-black text-amber-900">{step.title}</h3>

      <AnimatePresence mode="wait">
        <motion.p
          key={`desc-${stepIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-4 text-sm leading-relaxed text-amber-800 whitespace-pre-line"
        >
          {step.desc}
        </motion.p>
      </AnimatePresence>

      {/* Visual panel */}
      <div className="mb-4 rounded-2xl border border-amber-200 bg-white p-4">
        <AnimatePresence mode="wait">

          {/* Step 1: All 6 coins */}
          {stepIndex === 0 && (
            <motion.div
              key="all-coins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center items-end gap-4"
            >
              {COINS.map((coin, i) => (
                <CanadianCoin key={coin.value} coin={coin} animate delay={i * 0.1} showLabel />
              ))}
            </motion.div>
          )}

          {/* Step 2: Small coins */}
          {stepIndex === 1 && (
            <motion.div
              key="small-coins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center items-end gap-6 mb-4">
                {[COINS[0], COINS[1], COINS[2]].map((coin, i) => (
                  <CanadianCoin key={coin.value} coin={coin} animate delay={i * 0.15} showLabel />
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                      <CanadianCoin coin={COINS[1]} />
                    </motion.div>
                  ))}
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    className="text-sm font-black text-amber-700">= 20¢</motion.span>
                </div>
                <p className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  4 nickels = 5 + 5 + 5 + 5 = 20¢
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Big coins */}
          {stepIndex === 2 && (
            <motion.div
              key="big-coins"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center items-end gap-6 mb-4">
                {[COINS[3], COINS[4], COINS[5]].map((coin, i) => (
                  <CanadianCoin key={coin.name} coin={coin} animate delay={i * 0.15} showLabel />
                ))}
              </div>
              <div className="space-y-1.5 text-center">
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-xs font-bold text-amber-700">
                  4 quarters 🦌🦌🦌🦌 = $1.00 loonie 🦆
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                  className="text-xs font-bold text-amber-700">
                  2 loonies 🦆🦆 = $2.00 toonie 🐻
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Counting example */}
          {stepIndex === 3 && (
            <motion.div
              key="counting-example"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Coins row */}
              <div className="flex justify-center items-end gap-3 mb-4">
                {EXAMPLE_COINS.map((coin, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: i <= exampleStep ? 1.1 : 1, opacity: i <= exampleStep ? 1 : 0.35 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CanadianCoin coin={coin} animate delay={i * 0.1} />
                  </motion.div>
                ))}
              </div>

              {/* Running total */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`total-${exampleStep}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mb-3"
                >
                  <span className="text-3xl font-black text-amber-700">
                    {EXAMPLE_STEPS[exampleStep].running}¢
                  </span>
                  <p className="text-xs font-bold text-amber-500 mt-0.5">
                    {EXAMPLE_STEPS[exampleStep].label}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next coin buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setExampleStep(p => Math.max(0, p - 1))}
                  disabled={exampleStep === 0}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setExampleStep(p => Math.min(EXAMPLE_STEPS.length - 1, p + 1))}
                  disabled={exampleStep === EXAMPLE_STEPS.length - 1}
                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                >
                  Add Next Coin →
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setStepIndex(p => Math.max(0, p - 1))}
          disabled={stepIndex === 0}
          className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <div className="text-[11px] font-bold text-amber-600">Step {stepIndex + 1} of {LESSON_STEPS.length}</div>
        {stepIndex < LESSON_STEPS.length - 1 ? (
          <button
            onClick={() => { setStepIndex(p => p + 1); setExampleStep(0); }}
            className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onStartPractice}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white"
          >
            Start Practice!
          </button>
        )}
      </div>
    </div>
  );
};
