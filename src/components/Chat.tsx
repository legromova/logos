import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Session, Role, Message } from '../types';
import { Send, Volume2, RotateCcw, BarChart2, Loader2 } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import * as api from '../lib/api';

interface ChatProps {
  session: Session;
  onSendMessage: (content: string) => void;
  onVoiceRecording: (blob: Blob) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
}

export const Chat: React.FC<ChatProps> = ({ session, onSendMessage, onVoiceRecording, onAnalyze, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.OPPONENT: return 'bg-terracotta text-white';
      case Role.COACH: return 'bg-olive text-white';
      case Role.AUDIENCE: return 'bg-white/10 text-white';
      case Role.USER: return 'bg-ivory text-graphite self-end';
      default: return 'bg-white/5 text-white/50';
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.OPPONENT: return 'ОППОНЕНТ';
      case Role.COACH: return 'КОУЧ';
      case Role.AUDIENCE: return 'ЗАЛ';
      default: return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-8 space-y-6 scrollbar-hide px-2">
        {session.messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-1.5 ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}
          >
            {msg.role !== Role.USER && (
              <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${getRoleColor(msg.role)} bg-opacity-20 text-opacity-80`}>
                {getRoleLabel(msg.role)}
              </span>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${getRoleColor(msg.role)}`}>
              {msg.content}
              {msg.role !== Role.USER && (
                <button 
                  onClick={() => api.speak(msg.content, "alloy")}
                  className="ml-2 inline-flex items-center text-white/40 hover:text-white transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-white/30 text-xs italic">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI обдумывает аргумент...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pb-8 pt-4 space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={onAnalyze}
            disabled={session.messages.length < 2 || isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold/20 disabled:opacity-30 transition-all"
          >
            <BarChart2 className="w-4 h-4" /> Анализ
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Заново
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Сформулируйте аргумент..."
              className="w-full min-h-20 max-h-40 resize-y overflow-y-auto bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-white focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-graphite hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <VoiceRecorder onRecordingComplete={onVoiceRecording} isProcessing={isProcessing} />
        </form>
      </div>
    </div>
  );
};
