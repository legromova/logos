import React from 'react';
import { UserProgress, Difficulty } from '../types';
import { Trophy, Home, Settings, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  progress: UserProgress;
  onHome: () => void;
  onOpenSettings: () => void;
}

const LEVEL_LABELS = {
  [Difficulty.NOVICE]: '🥉 Новичок',
  [Difficulty.ORATOR]: '🥈 Оратор',
  [Difficulty.POLEMICIST]: '🥇 Полемист',
  [Difficulty.DEMOSTHENES]: '👑 Демосфен',
};

export const Header: React.FC<HeaderProps> = ({ progress, onHome, onOpenSettings }) => {
  return (
    <header className="border-b border-white/5 bg-graphite/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={onHome} className="group flex flex-col cursor-pointer">
            <span className="text-2xl font-black tracking-tighter text-gold group-hover:scale-105 transition-transform">LOGOS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-antique-gray font-bold">Тренажёр риторики</span>
          </button>

          <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-8 h-10">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-antique-gray uppercase tracking-widest">Уровень</span>
              <span className="text-sm font-medium">{LEVEL_LABELS[progress.level]}</span>
            </div>
            
            <div className="h-full w-px bg-white/10" />

            <div className="flex flex-col">
              <span className="text-xs font-bold text-antique-gray uppercase tracking-widest">Прогресс</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold" 
                    style={{ width: `${(progress.xp % 500) / 5}%` }} 
                  />
                </div>
                <span className="text-[10px] font-mono text-white/40">{progress.xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold">{progress.streak}</span>
          </div>
          
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
