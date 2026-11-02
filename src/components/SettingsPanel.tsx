import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Key, Shield, Info } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, apiKey, onSaveApiKey }) => {
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    onSaveApiKey(tempKey);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full max-w-md relative"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center">
          <Key className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">НАСТРОЙКИ</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Конфигурация OpenAI</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
            OpenAI API Key
            <div className="group relative">
              <Info className="w-3.5 h-3.5 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-graphite border border-white/10 rounded-lg text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Введите ваш ключ OpenAI (GPT-4o, Whisper, TTS).
              </div>
            </div>
          </label>
          <div className="relative">
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Введите ваш API ключ..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-all font-mono text-sm"
            />
          </div>
          <p className="text-[10px] text-white/30 flex items-center gap-1.5 mt-2">
            <Shield className="w-3 h-3" />
            Ваш ключ хранится локально в браузере и не передается третьим лицам.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full bg-gold text-graphite py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            Сохранить изменения
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-4 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </motion.div>
  );
};
