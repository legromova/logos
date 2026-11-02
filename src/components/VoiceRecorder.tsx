import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert('Ваш браузер не поддерживает запись аудио.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      // Request data in chunks every 1s for better stability
      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4">
      <AnimatePresence mode="wait">
        {!isRecording ? (
          <motion.button
            key="mic"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startRecording}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-graphite shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
          >
            {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Mic className="w-8 h-8" />}
          </motion.button>
        ) : (
          <motion.button
            key="stop"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-opacity-90 transition-all"
          >
            <Square className="w-8 h-8 fill-current" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-lg">{formatDuration(duration)}</span>
        </motion.div>
      )}
    </div>
  );
};
