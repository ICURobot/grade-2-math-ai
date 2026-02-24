/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { speechService } from '../services/speechService';

interface TutorProps {
  message: string;
  onReplay?: () => void;
}

export const Tutor: React.FC<TutorProps> = ({ message, onReplay }) => {
  const [isMuted, setIsMuted] = useState(speechService.getMute());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (message) {
      setIsSpeaking(true);
      speechService.speak(message, () => setIsSpeaking(false));
    }
  }, [message]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    speechService.setMute(newMute);
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        {/* Tutor Avatar */}
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
        >
          <span className="text-4xl">🤖</span>
        </motion.div>
        
        {/* Speech Indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-sm"
            >
              <Volume2 size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <p className="text-slate-700 text-center font-medium leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-center gap-4 mt-3">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={onReplay}
            className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
