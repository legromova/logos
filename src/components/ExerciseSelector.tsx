import React from 'react';
import { motion } from 'motion/react';
import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';
import { Trophy, Target, Clock } from 'lucide-react';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {EXERCISES.map((ex, i) => (
        <motion.button
          key={ex.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(ex)}
          className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl text-left transition-all hover:bg-white/10 hover:border-gold/50 hover:shadow-[0_0_20px_rgba(197,154,58,0.1)]"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">{ex.title}</h3>
            <div className="flex gap-1">
              {[...Array(ex.difficulty)].map((_, j) => (
                <Trophy key={j} className="w-4 h-4 text-gold fill-gold" />
              ))}
            </div>
          </div>
          
          <p className="text-sm text-white/60 mb-6 line-clamp-2 leading-relaxed">
            {ex.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-white/40">
            <div className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {ex.evaluationCriteria.length} критериев
            </div>
          </div>

          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gold text-sm font-bold uppercase tracking-widest">Старт →</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
