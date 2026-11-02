import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, Session, Message, Role, Difficulty, UserProgress, Analysis } from './types';
import { Header } from './components/Header';
import { ExerciseSelector } from './components/ExerciseSelector';
import { Chat } from './components/Chat';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { EXERCISES } from './data/exercises';
import * as api from './lib/api';

const DEFAULT_PROGRESS: UserProgress = {
  level: Difficulty.NOVICE,
  xp: 0,
  streak: 0,
  skills: { logos: 5, ethos: 5, pathos: 5, structure: 5 },
  history: []
};

function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('logos-progress');
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState<Analysis | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('logos-api-key') || '');

  useEffect(() => {
    localStorage.setItem('logos-progress', JSON.stringify(progress));
  }, [progress]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('logos-api-key', key);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: exercise.id,
      topic: "Загрузка темы...", // Will be updated by AI
      status: 'active',
      createdAt: Date.now(),
      messages: []
    };
    setActiveSession(newSession);
    startSession(exercise, newSession);
  };

  const startSession = async (exercise: Exercise, session: Session) => {
    setIsProcessing(true);
    try {
      const prompt = `Инициируй упражнение "${exercise.title}". Описание: ${exercise.description}. Цель: ${exercise.objective}. Сначала назови тему или тезис, с которого мы начнем.`;
      const res = await api.chat(prompt, [], exercise.systemPrompt);
      
      const welcomeMsg: Message = {
        id: Date.now().toString(),
        role: Role.OPPONENT,
        content: res.message,
        createdAt: Date.now()
      };
      
      setActiveSession({
        ...session,
        messages: [welcomeMsg]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession || !content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content,
      createdAt: Date.now()
    };

    const updatedSession = {
      ...activeSession,
      messages: [...activeSession.messages, userMsg]
    };
    setActiveSession(updatedSession);
    setIsProcessing(true);

    try {
      const exercise = EXERCISES.find(e => e.id === activeSession.exerciseId)!;
      const history = updatedSession.messages.map(m => ({
        role: m.role === Role.USER ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const res = await api.chat(content, history, exercise.systemPrompt);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.OPPONENT,
        content: res.message,
        createdAt: Date.now()
      };

      setActiveSession({
        ...updatedSession,
        messages: [...updatedSession.messages, aiMsg]
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Произошла ошибка при отправке сообщения');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!activeSession) return;
    setIsProcessing(true);
    try {
      const exercise = EXERCISES.find(e => e.id === activeSession.exerciseId)!;
      const userMessages = activeSession.messages.filter(m => m.role === Role.USER);
      const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";
      
      const result = await api.analyze(lastUserMsg, {
        exercise: exercise.title,
        history: activeSession.messages.map(m => `${m.role}: ${m.content}`).join('\n')
      });
      
      setShowAnalysis(result);
      updateProgress(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateProgress = (analysis: Analysis) => {
    setProgress(prev => {
      const newXp = prev.xp + 50;
      const newLevel = Math.floor(newXp / 500) + 1;
      
      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, Difficulty.DEMOSTHENES) as Difficulty,
        skills: {
          logos: Math.min(10, (prev.skills.logos + analysis.scores.logic) / 2),
          ethos: Math.min(10, (prev.skills.ethos + analysis.scores.ethos) / 2),
          pathos: Math.min(10, (prev.skills.pathos + analysis.scores.pathos) / 2),
          structure: Math.min(10, (prev.skills.structure + analysis.scores.structure) / 2),
        }
      };
    });
  };

  const handleVoiceUpload = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const transcriptionPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const res = await api.transcribe(base64, blob.type);
            resolve(res.text || "");
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(blob);
      const text = await transcriptionPromise;
      
      if (text) {
        handleSendMessage(text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Ошибка при обработке голоса. Проверьте настройки API.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-graphite selection:bg-gold/30">
      <Header 
        progress={progress} 
        onHome={() => setActiveSession(null)} 
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!activeSession ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto w-full"
            >
              <div className="px-6 pt-12 pb-6">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ВЫБЕРИТЕ УПРАЖНЕНИЕ</h1>
                <p className="text-antique-gray">Оттачивайте мастерство в виртуальном античном форуме</p>
              </div>
              <ExerciseSelector onSelect={handleSelectExercise} />
            </motion.div>
          ) : (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 relative"
            >
              <Chat 
                session={activeSession} 
                onSendMessage={handleSendMessage}
                onVoiceRecording={handleVoiceUpload}
                onAnalyze={handleAnalyze}
                isProcessing={isProcessing}
              />
              
              <AnimatePresence>
                {showAnalysis && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-graphite/80 backdrop-blur-sm">
                    <div className="w-full max-w-4xl">
                      <AnalysisPanel analysis={showAnalysis} onClose={() => setShowAnalysis(null)} />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-graphite/90 backdrop-blur-sm">
              <SettingsPanel 
                apiKey={apiKey} 
                onSaveApiKey={handleSaveApiKey} 
                onClose={() => setShowSettings(false)} 
              />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
