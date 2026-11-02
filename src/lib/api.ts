import { Message, Analysis } from '../types';

const getHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const customKey = localStorage.getItem('logos-api-key');
  if (customKey) {
    headers["x-api-key"] = customKey;
  }
  return headers;
};

export const chat = async (message: string, history: any[], systemPrompt: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message, history, systemPrompt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to send message");
  return data;
};

export const analyze = async (transcript: string, context: any): Promise<Analysis> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ transcript, context }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to analyze response");
  return data;
};

export const transcribe = async (audioData: string, mimeType: string) => {
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ audioData, mimeType }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to transcribe audio");
  return data;
};

export const speak = async (text: string, voice: string = "alloy") => {
  const response = await fetch("/api/speech", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text, voice }),
  });
  if (!response.ok) throw new Error("Failed to generate speech");
  const data = await response.json();
  if (data.audioData) {
    const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
    return audio.play();
  }
};
