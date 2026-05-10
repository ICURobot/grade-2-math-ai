/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Settings,
  BarChart2,
  ChevronRight,
  Star,
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Clock,
  FastForward,
  Volume2,
  Lock
} from 'lucide-react';

import { SkillArea, Difficulty, Problem, SessionResult, GradeLevel } from './types';
import { generateProblem } from './services/problemGenerator';
import { saveSession, getStats } from './services/storageService';
import { speechService } from './services/speechService';

import { Tutor } from './components/Tutor';
import { Keypad } from './components/Keypad';
import { Dashboard } from './components/Dashboard';
import { DivisionLesson } from './components/DivisionLesson';
import { CoinsLesson } from './components/CoinsLesson';
import { grade3Topics } from './content/grade3Topics';

type View = 'home' | 'session' | 'dashboard' | 'summary';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [grade, setGrade] = useState<GradeLevel>('grade2');
  const [skill, setSkill] = useState<SkillArea>('Addition');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [sessionLength, setSessionLength] = useState(5);
  const [speechRate, setSpeechRate] = useState(speechService.getRate());
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [tutorMessage, setTutorMessage] = useState('');
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [hintCardVisible, setHintCardVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showDivisionLesson, setShowDivisionLesson] = useState(false);
  const [showCoinsLesson, setShowCoinsLesson] = useState(false);
  
  // Graphing Discipline
  const [graphLabelsVerified, setGraphLabelsVerified] = useState(false);
  const [constructionValues, setConstructionValues] = useState<number[]>([]);
  
  // Adaptive Learning State
  const [subskillStats, setSubskillStats] = useState<Record<string, { correct: number, total: number }>>({});
  const [mistakeTags, setMistakeTags] = useState<string[]>([]);
  const [followUpMode, setFollowUpMode] = useState(false);

  // Grade 3 anti-repeat: tracks problem signatures seen in the current session
  const seenSignaturesRef = useRef<Set<string>>(new Set());

  // Home Screen State
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    if (view === 'home') {
      setStats(getStats());
      setFollowUpMode(false);
    }
  }, [view]);

  /**
   * Generates a problem for grade3, retrying up to MAX_RETRIES times to avoid
   * repeating a question already seen in this session. Falls back to the last
   * generated problem if all retries produce duplicates.
   * Grade2 problems pass through unchanged.
   */
  const generateNextProblem = useCallback(
    (selectedSkill: SkillArea, diff: Difficulty, gradeLevel: GradeLevel): Problem => {
      if (gradeLevel !== 'grade3') return generateProblem(selectedSkill, diff, gradeLevel);
      const MAX_RETRIES = 10;
      let problem = generateProblem(selectedSkill, diff, gradeLevel);
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const sig = `${problem.skill}|${problem.subskill}|${problem.question}|${problem.correctAnswer}`;
        if (!seenSignaturesRef.current.has(sig)) {
          seenSignaturesRef.current.add(sig);
          return problem;
        }
        problem = generateProblem(selectedSkill, diff, gradeLevel);
      }
      // Accept whatever we have after exhausting retries
      const sig = `${problem.skill}|${problem.subskill}|${problem.question}|${problem.correctAnswer}`;
      seenSignaturesRef.current.add(sig);
      return problem;
    },
    []
  );

  const startSession = (selectedSkill: SkillArea) => {
    setSkill(selectedSkill);
    setProblemIndex(0);
    setSessionResults([]);
    setSubskillStats({});
    setMistakeTags([]);
    seenSignaturesRef.current = new Set();

    const firstProblem = generateNextProblem(selectedSkill, difficulty, grade);
    setCurrentProblem(firstProblem);
    setTutorMessage(firstProblem.narrations.intro);
    setUserInput('');
    setHintLevel(0);
    setShowSteps(false);
    setHintCardVisible(false);
    setIsCorrect(null);
    setShowDivisionLesson(grade === 'grade2' && selectedSkill === 'Division');
    setShowCoinsLesson(grade === 'grade2' && selectedSkill === 'Coins');
    setGraphLabelsVerified(false);
    if (firstProblem.visualData?.buildMode) {
      setConstructionValues(firstProblem.visualData.values.map(() => 0));
    }
    setView('session');
  };

  const handleNextProblem = useCallback(() => {
    if (problemIndex + 1 >= sessionLength) {
      const finalResult: SessionResult = {
        date: new Date().toISOString(),
        grade,
        skill,
        difficulty,
        totalQuestions: sessionLength,
        correctCount: sessionResults.filter(r => r).length,
        mistakeTags,
        subskillStats
      };
      saveSession(finalResult);
      setView('summary');
    } else {
      const nextIdx = problemIndex + 1;
      setProblemIndex(nextIdx);
      
      const nextProblem = generateNextProblem(skill, difficulty, grade);
      if (followUpMode) setFollowUpMode(false);
      
      setCurrentProblem(nextProblem);
      setTutorMessage(nextProblem.narrations.intro);
      setUserInput('');
      setHintLevel(0);
      setShowSteps(false);
      setHintCardVisible(false);
      setIsCorrect(null);
      setGraphLabelsVerified(false);
      if (nextProblem.visualData?.buildMode) {
        setConstructionValues(nextProblem.visualData.values.map(() => 0));
      }
    }
  }, [problemIndex, sessionLength, skill, difficulty, grade, sessionResults, followUpMode, mistakeTags, subskillStats, generateNextProblem]);

  const checkAnswer = () => {
    if (!currentProblem) return;
    
    // Graphing discipline check
    if (currentProblem.visualData?.buildMode && !graphLabelsVerified) {
      const msg = "Don't forget to check your Title and Axis Labels first!";
      setTutorMessage(msg);
      speechService.speak(msg);
      return;
    }

    const isGraphConstruction = !!currentProblem.visualData?.buildMode;
    const isAnswerCorrect = isGraphConstruction
      ? constructionValues.every((value, idx) => value === currentProblem.visualData.values[idx])
      : userInput.trim().toLowerCase() === currentProblem.correctAnswer.toString().toLowerCase();
    
    // Update subskill stats
    const currentSubskill = currentProblem.subskill;
    const currentSubData = subskillStats[currentSubskill] || { correct: 0, total: 0 };
    
    if (isAnswerCorrect) {
      setIsCorrect(true);
      const firstTry = hintLevel === 0;
      setSessionResults([...sessionResults, firstTry]);
      
      setSubskillStats({
        ...subskillStats,
        [currentSubskill]: { 
          correct: currentSubData.correct + (firstTry ? 1 : 0), 
          total: currentSubData.total + 1 
        }
      });

      setTutorMessage(currentProblem.narrations.success);
      speechService.speak(currentProblem.narrations.success);
      
      setTimeout(() => {
        handleNextProblem();
      }, 2000);
    } else {
      setIsCorrect(false);
      setHintLevel(prev => prev + 1);

      // Track mistake tags
      if (hintLevel === 0) {
        const newTags = [...mistakeTags];
        if (currentProblem.skill === 'Addition' || currentProblem.skill === 'Subtraction') {
          // Heuristic for mistake tagging
          const val = parseInt(userInput);
          if (!isNaN(val)) {
            if (Math.abs(val - (currentProblem.correctAnswer as number)) % 10 === 0) {
              newTags.push('tens_place_error');
            } else if (Math.abs(val - (currentProblem.correctAnswer as number)) < 10) {
              newTags.push('ones_place_error');
            }
          }
        }
        setMistakeTags(newTags);
        setFollowUpMode(true); // Trigger reinforcement next
      }

      // Hints unlock after 2 wrong attempts (hintLevel reflects attempts so far before this one)
      let msg: string;
      if (hintLevel === 0) {
        msg = "Hmm, not quite! Give it another try — you can do it! 💪";
      } else if (hintLevel === 1) {
        msg = "Almost! One more try… your hint is almost ready!";
      } else if (hintLevel === 2) {
        msg = currentProblem.narrations.hint1;
        setHintCardVisible(true);
      } else if (hintLevel === 3) {
        msg = currentProblem.narrations.hint2;
        setHintCardVisible(true);
      } else {
        msg = currentProblem.narrations.solution;
        setHintCardVisible(true);
        setShowSteps(true);
      }

      setTutorMessage(msg);
      speechService.speak(msg);

      setTimeout(() => {
        // For construction mode, preserve userInput so Check Answer stays enabled
        if (!currentProblem.visualData?.buildMode) {
          setUserInput('');
        }
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleSpeechRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    speechService.setRate(rate);
  };

  const renderHome = () => (
    <div className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hi Pumpkin! 👋</h1>
          <p className="text-slate-500">Ready for some math fun?</p>
        </div>
        <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-200">
          <Star className="text-yellow-500 fill-yellow-500" size={18} />
          <span className="font-bold text-yellow-700">{stats.totalStars}</span>
        </div>
      </header>

      <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Current Streak</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{stats.streak}</span>
            <span className="text-indigo-200 font-medium">Days</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <Trophy size={120} />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Choose Grade</h3>
        <div className="flex gap-2">
          {(['grade2', 'grade3'] as GradeLevel[]).map(g => (
            <button
              key={g}
              onClick={() => {
                setGrade(g);
                setSkill(g === 'grade2' ? 'Addition' : 'Place Value and Rounding');
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase border-2 transition-all ${grade === g ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
            >
              {g === 'grade2' ? 'Grade 2' : 'Grade 3'}
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">Pick a {grade === 'grade2' ? 'Skill' : 'Topic'}</h3>
      <div className="grid grid-cols-1 gap-4">
        {(grade === 'grade2'
          ? [
              { id: 'Addition', label: 'Addition', icon: '➕', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { id: 'Subtraction', label: 'Subtraction', icon: '➖', color: 'bg-blue-50 text-blue-600 border-blue-100' },
              { id: 'Division', label: 'Division Lesson + Practice', icon: '➗', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
              { id: 'Equality', label: 'Equality', icon: '⚖️', color: 'bg-purple-50 text-purple-600 border-purple-100' },
              { id: 'Fractions', label: 'Fractions', icon: '🍕', color: 'bg-rose-50 text-rose-600 border-rose-100' },
              { id: 'Graphing', label: 'Data & Graphs', icon: '📊', color: 'bg-orange-50 text-orange-600 border-orange-100' },
              { id: 'Time', label: 'Telling Time', icon: '⏰', color: 'bg-pink-50 text-pink-600 border-pink-100' },
              { id: 'Coins', label: 'Canadian Coins', icon: '🪙', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            ]
          : grade3Topics
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => startSession(item.id as SkillArea)}
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all active:scale-95 ${item.color}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-lg font-bold">{item.label}</span>
            </div>
            <ChevronRight size={24} />
          </button>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Settings size={18} className="text-slate-400" />
          Settings
        </h3>
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize border-2 transition-all ${difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex justify-between">
              <span>Tutor Speed</span>
              <span>{Math.round(speechRate * 100)}%</span>
            </label>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-slate-300" />
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.1" 
                value={speechRate} 
                onChange={handleSpeechRateChange}
                className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <FastForward size={16} className="text-slate-300" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Questions</label>
            <div className="flex gap-2">
              {[5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setSessionLength(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${sessionLength === n ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSession = () => {
    if (!currentProblem) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
          <button onClick={() => setView('home')} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
          <div className="flex-1 mx-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((problemIndex + 1) / sessionLength) * 100}%` }}
                className="bg-indigo-500 h-full"
              />
            </div>
          </div>
          <span className="text-sm font-bold text-slate-400">{problemIndex + 1}/{sessionLength}</span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Tutor 
            message={tutorMessage} 
            onReplay={() => speechService.speak(tutorMessage)} 
          />
          {currentProblem.skill === 'Division' && showDivisionLesson && (
            <DivisionLesson onStartPractice={() => setShowDivisionLesson(false)} />
          )}
          {currentProblem.skill === 'Coins' && showCoinsLesson && (
            <CoinsLesson onStartPractice={() => setShowCoinsLesson(false)} />
          )}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{currentProblem.prompt}</p>
            
            {currentProblem.visualData?.type === 'bar-graph' && (
              <div className="mb-6">
                {currentProblem.visualData?.buildMode && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">Data Table — tap bars to match</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      {currentProblem.visualData.items.map((item: string, i: number) => (
                        <div key={i} className="text-center">
                          <div className="text-xl font-black text-orange-600">{currentProblem.visualData.values[i]}</div>
                          <div className="text-[10px] font-bold text-slate-500">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h4 className="font-bold text-slate-700 mb-4">{currentProblem.visualData.title}</h4>
                {(() => {
                  const dataMax: number = Math.max(...(currentProblem.visualData.values as number[]));
                  const graphMax = dataMax <= 10 ? 10 : Math.ceil(dataMax / 2) * 2;
                  const tickStep = 2;
                  const yTicks = Array.from({ length: Math.floor(graphMax / tickStep) + 1 }, (_, k) => k * tickStep);
                  return (
                    <div className="flex items-end">
                      {/* Y-axis labels */}
                      <div className="flex flex-col-reverse justify-between h-32 pr-1 pb-5">
                        {yTicks.map(n => (
                          <span key={n} className="text-[9px] font-bold text-slate-400 leading-none">{n}</span>
                        ))}
                      </div>
                      {/* Bar graph */}
                      <div className="flex flex-1 justify-center gap-2 h-32 border-b border-l border-slate-200 p-2">
                        {currentProblem.visualData.items.map((item: string, i: number) => {
                          const val = currentProblem.visualData?.buildMode ? constructionValues[i] : currentProblem.visualData.values[i];
                          return (
                            <div
                              key={i}
                              className={`flex flex-col items-center justify-end flex-1 max-w-[60px] h-full ${currentProblem.visualData?.buildMode ? 'cursor-pointer' : ''}`}
                              onClick={() => {
                                if (currentProblem.visualData?.buildMode) {
                                  const next = [...constructionValues];
                                  next[i] = (next[i] + 1) % (graphMax + 1);
                                  setConstructionValues(next);
                                  setUserInput(next.join(','));
                                }
                              }}
                            >
                              <span className="text-[9px] font-black text-slate-600 mb-0.5">{val > 0 ? val : ''}</span>
                              <motion.div
                                initial={false}
                                animate={{ height: `${(val / graphMax) * 100}%` }}
                                className={`w-full rounded-t-md transition-all duration-300 ${currentProblem.visualData?.buildMode ? 'bg-orange-500 hover:bg-orange-400' : 'bg-indigo-500'}`}
                              />
                              <span className="text-[8px] font-bold text-slate-400 mt-2 truncate w-full">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="flex justify-between mt-1 px-4">
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{currentProblem.visualData.xLabel}</span>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{currentProblem.visualData.yLabel}</span>
                </div>
                
                {currentProblem.visualData?.buildMode && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-xs text-slate-500 italic">Tap the bars to match the data!</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setGraphLabelsVerified(!graphLabelsVerified)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${graphLabelsVerified ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        {graphLabelsVerified ? '✓ Labels Checked' : 'Check Labels'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(currentProblem.visualData?.type === 'fraction-bar' || currentProblem.visualData?.type === 'fraction-compare') && (
              <div className="flex flex-col items-center gap-4 mb-6">
                {currentProblem.visualData.type === 'fraction-bar' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex rounded-xl overflow-hidden border-2 border-rose-300 h-14" style={{ width: 240 }}>
                      {Array.from({ length: currentProblem.visualData.denominator }).map((_: unknown, i: number) => (
                        <div
                          key={i}
                          className={`flex-1 ${i < currentProblem.visualData.numerator ? 'bg-rose-400' : 'bg-rose-50'} ${i < currentProblem.visualData.denominator - 1 ? 'border-r-2 border-rose-300' : ''}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                      {currentProblem.visualData.numerator} out of {currentProblem.visualData.denominator} parts shaded
                    </p>
                  </div>
                )}
                {currentProblem.visualData.type === 'fraction-compare' && (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    {[currentProblem.visualData.a, currentProblem.visualData.b].map((frac: { n: number; d: number }, fi: number) => (
                      <div key={fi} className="flex items-center gap-3">
                        <span className="text-sm font-black text-rose-600 w-10 text-right">{frac.n}/{frac.d}</span>
                        <div className="flex flex-1 rounded-lg overflow-hidden border-2 border-rose-300 h-10">
                          {Array.from({ length: frac.d }).map((_: unknown, i: number) => (
                            <div
                              key={i}
                              className={`flex-1 ${i < frac.n ? 'bg-rose-400' : 'bg-rose-50'} ${i < frac.d - 1 ? 'border-r-2 border-rose-300' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentProblem.visualData?.type === 'clock' && (
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40 rounded-full border-4 border-slate-800 bg-white flex items-center justify-center">
                  {/* Clock Numbers */}
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => (
                    <span 
                      key={n} 
                      className="absolute font-bold text-slate-800 text-sm"
                      style={{ 
                        transform: `rotate(${i * 30}deg) translateY(-65px) rotate(-${i * 30}deg)` 
                      }}
                    >
                      {n}
                    </span>
                  ))}
                  {/* Hands */}
                  <div 
                    className="absolute left-1/2 bottom-1/2 w-1 h-12 bg-slate-800 rounded-full origin-bottom"
                    style={{ transform: `translateX(-50%) rotate(${currentProblem.visualData.hour * 30 + currentProblem.visualData.minute * 0.5}deg)` }}
                  />
                  <div 
                    className="absolute left-1/2 bottom-1/2 w-1 h-16 bg-indigo-500 rounded-full origin-bottom"
                    style={{ transform: `translateX(-50%) rotate(${currentProblem.visualData.minute * 6}deg)` }}
                  />
                  <div className="w-2 h-2 bg-slate-800 rounded-full z-10" />
                </div>
              </div>
            )}


            {currentProblem.visualData?.type === 'place-value' && (
              <div className="mb-6 bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-violet-400 mb-2">Place Value Chart</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {['Thousands', 'Hundreds', 'Tens', 'Ones'].map((h, i) => (
                    <div key={h} className="bg-violet-50 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-violet-500">{h}</p>
                      <p className="text-xl font-black text-violet-700">{Math.floor(currentProblem.visualData.number / Math.pow(10, 3 - i)) % 10}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentProblem.visualData?.type === 'array' && (
              <div className="mb-6 flex flex-col items-center gap-1">
                {Array.from({ length: currentProblem.visualData.rows }).map((_, ri) => (
                  <div key={ri} className="flex gap-1">
                    {Array.from({ length: currentProblem.visualData.cols }).map((__, ci) => (
                      <span key={ci} className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {currentProblem.visualData?.type === 'division-groups' && (
              <div className="mb-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
                  Equal Groups Model
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: currentProblem.visualData.groups }).map((_, gi) => (
                    <div key={gi} className="rounded-xl border border-cyan-200 bg-white p-2">
                      <p className="text-[10px] font-bold text-cyan-500">Group {gi + 1}</p>
                      <div className="mt-1 flex flex-wrap justify-center gap-1 min-h-[22px]">
                        {Array.from({ length: currentProblem.visualData.groupSize }).map((__, ci) => (
                          <motion.span
                            key={ci}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: gi * 0.08 + ci * 0.04 }}
                            className="inline-block h-3 w-3 rounded-full bg-cyan-500"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentProblem.visualData?.type === 'coins' && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {currentProblem.visualData.coins.map((coin: number, i: number) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center text-xs font-black text-yellow-700">{coin}¢</div>
                ))}
              </div>
            )}

            {currentProblem.visualData?.type === 'coins-canadian' && (() => {
              const coinMeta: Record<number, { bg: string; hl: string; border: string; text: string; textColor: string; name: string; sz: number }> = {
                1:   { bg: '#C47722', hl: '#E8A040', border: '#8B5610', text: '1¢',  textColor: '#fff9f0', name: 'Penny',   sz: 44 },
                5:   { bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', text: '5¢',  textColor: '#222',    name: 'Nickel',  sz: 50 },
                10:  { bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', text: '10¢', textColor: '#222',    name: 'Dime',    sz: 40 },
                25:  { bg: '#B8B8B8', hl: '#DCDCDC', border: '#787878', text: '25¢', textColor: '#222',    name: 'Quarter', sz: 58 },
                100: { bg: '#C9A220', hl: '#EDD040', border: '#907010', text: '$1',  textColor: '#3D2600', name: 'Loonie',  sz: 64 },
                200: { bg: '#C9A220', hl: '#EDD040', border: '#907010', text: '$2',  textColor: '#222',    name: 'Toonie',  sz: 68 },
              };
              return (
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">Canadian Coins 🍁</p>
                  <div className="flex flex-wrap justify-center items-end gap-4">
                    {(currentProblem.visualData.coins as number[]).map((coin, i) => {
                      const m = coinMeta[coin] ?? coinMeta[10];
                      const bw = Math.max(2, Math.round(m.sz * 0.05));
                      const fs = m.sz < 42 ? 9 : m.sz < 52 ? 11 : 13;
                      if (coin === 200) {
                        return (
                          <motion.div key={i} className="flex flex-col items-center gap-1"
                            initial={{ scale: 0, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 14 }}>
                            <div style={{ width: m.sz, height: m.sz, borderRadius: '50%',
                              background: `radial-gradient(circle at 35% 30%, ${m.hl}, ${m.bg} 60%, #6A5000 100%)`,
                              border: `${bw}px solid ${m.border}`,
                              boxShadow: '0 3px 8px rgba(0,0,0,0.35), inset 0 1px 4px rgba(255,255,255,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: m.sz * 0.52, height: m.sz * 0.52, borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 30%, #E8E8E8, #ADADAD 60%, #686868 100%)',
                                border: '2px solid #808080', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)' }}>
                                <span style={{ fontSize: 9, fontWeight: 900, color: '#333' }}>$2</span>
                              </div>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 800, color: '#666' }}>Toonie</span>
                          </motion.div>
                        );
                      }
                      return (
                        <motion.div key={i} className="flex flex-col items-center gap-1"
                          initial={{ scale: 0, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 14 }}>
                          <div style={{ width: m.sz, height: m.sz, borderRadius: '50%',
                            background: `radial-gradient(circle at 35% 30%, ${m.hl}, ${m.bg} 65%, ${m.border} 100%)`,
                            border: `${bw}px solid ${m.border}`,
                            boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: fs, fontWeight: 900, color: m.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
                              {m.text}
                            </span>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#666' }}>{m.name}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {currentProblem.visualData?.type === 'grid-rect' && (
              <div className="mb-6 flex justify-center">
                <div className="grid gap-[2px] bg-slate-300 p-[2px] rounded" style={{ gridTemplateColumns: `repeat(${currentProblem.visualData.l}, minmax(0, 14px))` }}>
                  {Array.from({ length: currentProblem.visualData.l * currentProblem.visualData.w }).map((_, i) => (
                    <div key={i} className="w-[14px] h-[14px] bg-lime-100" />
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">
              {currentProblem.question.split('__').map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i === 0 && currentProblem.question.includes('__') && (
                    <span className="inline-block w-16 border-b-4 border-indigo-500 mx-2 text-indigo-600">
                      {userInput || '?'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h2>

            {!currentProblem.question.includes('__') && !currentProblem.choices && (
              <div className="flex items-center justify-center gap-4 text-3xl font-bold">
                <div className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl border-2 border-indigo-100 min-w-[100px]">
                  {userInput || '?'}
                </div>
              </div>
            )}

            {currentProblem.choices && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {currentProblem.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => setUserInput(choice.toString())}
                    className={`py-4 rounded-2xl font-bold text-xl border-2 transition-all ${userInput === choice.toString() ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-700'}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 flex items-center justify-center gap-2 font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {isCorrect ? (
                    <><CheckCircle2 size={20} /> Correct!</>
                  ) : (
                    <><AlertCircle size={20} /> Try again!</>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint card — locked until 2 wrong attempts */}
          <AnimatePresence>
            {hintLevel < 2 && hintLevel > 0 && (
              <motion.div
                key="hint-locked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 mb-4 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400"
              >
                <Lock size={15} />
                <span className="text-xs font-bold">
                  Hint unlocks after {2 - hintLevel} more {2 - hintLevel === 1 ? 'try' : 'tries'}
                </span>
              </motion.div>
            )}
            {hintCardVisible && currentProblem && (
              <motion.div
                key="hint-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
              >
                <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Hint</p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {hintLevel >= 4
                      ? currentProblem.narrations.hint2
                      : currentProblem.narrations.hint1}
                  </p>
                </div>
                <button
                  onClick={() => speechService.speak(
                    hintLevel >= 4
                      ? currentProblem.narrations.hint2
                      : currentProblem.narrations.hint1
                  )}
                  className="shrink-0 p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 transition-colors"
                  aria-label="Hear hint"
                >
                  <Volume2 size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {hintLevel >= 2 && (
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-indigo-600 text-sm font-bold flex items-center gap-1"
              >
                <Lightbulb size={16} />
                {showSteps ? 'Hide Steps' : 'Show Steps'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-indigo-50 rounded-2xl p-4 mb-6 border border-indigo-100"
              >
                <ul className="space-y-4">
                  {currentProblem.steps.map((step, i) => (
                    <li key={i} className="text-sm text-indigo-700">
                      <p className="font-bold uppercase text-[10px] tracking-widest mb-1">{step.label}</p>
                      <p className="whitespace-pre-line leading-relaxed">{step.content}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {!currentProblem.choices && !currentProblem.visualData?.buildMode && (
            <Keypad 
              onPress={(v) => setUserInput(prev => (prev.length < 5 ? prev + v : prev))}
              onDelete={() => setUserInput(prev => prev.slice(0, -1))}
              onClear={() => setUserInput('')}
            />
          )}

          <button
            onClick={checkAnswer}
            disabled={!userInput || isCorrect === true}
            className={`w-full mt-8 py-5 rounded-3xl text-xl font-black shadow-lg transition-all active:scale-95 ${
              !userInput || isCorrect === true 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white shadow-indigo-200'
            }`}
          >
            Check Answer
          </button>
        </main>
      </div>
    );
  };

  const renderSummary = () => {
    const correctCount = sessionResults.filter(r => r).length;
    const percentage = Math.round((correctCount / sessionLength) * 100);

    return (
      <div className="min-h-screen bg-indigo-600 p-6 flex flex-col items-center justify-center text-white text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
          <Trophy size={64} className="text-yellow-500" />
        </motion.div>
        
        <h1 className="text-4xl font-black mb-2">Session Complete!</h1>
        <p className="text-indigo-100 text-lg mb-8">You worked so hard today!</p>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-sm mb-8 border border-white/20">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Score</p>
              <p className="text-3xl font-black">{correctCount}/{sessionLength}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</p>
              <p className="text-3xl font-black">{percentage}%</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={24} />
            <span className="text-2xl font-bold">+{correctCount} Stars</span>
          </div>
        </div>

        <button
          onClick={() => setView('home')}
          className="w-full max-w-sm bg-white text-indigo-600 py-5 rounded-3xl text-xl font-black shadow-xl transition-all active:scale-95"
        >
          Back to Home
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderHome()}
          </motion.div>
        )}
        {view === 'session' && (
          <motion.div key="session" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            {renderSession()}
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard />
          </motion.div>
        )}
        {view === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {renderSummary()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {view !== 'session' && view !== 'summary' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4 flex justify-around items-center z-50">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Home size={24} />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <BarChart2 size={24} />
            <span className="text-[10px] font-bold uppercase">Progress</span>
          </button>
        </nav>
      )}
    </div>
  );
}
