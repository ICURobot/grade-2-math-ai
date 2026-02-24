/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onPress: (val: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onPress, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-6">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === 'C') onClear();
            else if (key === 'DEL') onDelete();
            else onPress(key);
          }}
          className={`
            h-16 rounded-2xl text-2xl font-bold transition-all active:scale-95
            ${key === 'C' ? 'bg-orange-100 text-orange-600' : 
              key === 'DEL' ? 'bg-red-100 text-red-600' : 
              'bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50'}
          `}
        >
          {key === 'DEL' ? <Delete className="mx-auto" /> : key}
        </button>
      ))}
    </div>
  );
};
