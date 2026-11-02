import React from 'react';
import { motion } from 'motion/react';
import { Analysis, Scores } from '../types';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: Analysis;
  onClose: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, onClose }) => {
  const scoreItems = [
    { label: 'LOGOS', value: analysis.scores.logic },
    { label: 'ETHOS', value: analysis.scores.ethos },
    { label: 'PATHOS', value: analysis.scores.pathos },
    { label: 'STRUCTURE', value: analysis.scores.structure },
    { label: 'EVIDENCE', value: analysis.scores.evidence },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto scrollbar-hide"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gold tracking-tight">АНАЛИЗ АРГУМЕНТАЦИИ</h2>
        <button onClick={onClose} className="text-white/50 hover:text-white">Закрыть</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/40 mb-4 tracking-widest uppercase">Метрики</h3>
            <div className="space-y-4">
              {scoreItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.label}</span>
                    <span>{item.value}/10</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 10}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white/40 mb-4 tracking-widest uppercase">
              <Sparkles className="w-4 h-4" /> Улучшенная версия
            </h3>
            <p className="text-sm italic leading-relaxed text-white/80">
              "{analysis.improvedVersion}"
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-green-400/60 mb-3 tracking-widest uppercase">
              <CheckCircle2 className="w-4 h-4" /> Сильные стороны
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/70">
                  <span className="text-green-400">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-red-400/60 mb-3 tracking-widest uppercase">
              <AlertCircle className="w-4 h-4" /> Точки роста
            </h3>
            <ul className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/70">
                  <span className="text-red-400">•</span> {w}
                </li>
              ))}
            </ul>
          </div>

          {analysis.fallacies.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-xs font-bold text-red-400 mb-2 uppercase">⚠ Обнаружены уловки</h3>
              {analysis.fallacies.map((f, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="text-sm font-semibold text-red-300">{f.name}</div>
                  <div className="text-xs text-red-200/70">{f.explanation}</div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <h3 className="text-xs font-bold text-gold mb-2 uppercase">Следующий вызов</h3>
            <div className="flex items-center gap-2 text-sm bg-gold/10 border border-gold/20 p-3 rounded-lg text-gold/90">
              <ArrowRight className="w-4 h-4" />
              {analysis.nextChallenge}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
