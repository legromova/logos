import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const getOpenAIClient = (apiKey?: string) => {
  const resolvedApiKey = apiKey || process.env.OPENAI_API_KEY;
  if (!resolvedApiKey) {
    throw new Error("OpenAI API key не настроен. Укажите OPENAI_API_KEY или задайте ключ в настройках приложения.");
  }

  return new OpenAI({
    apiKey: resolvedApiKey,
  });
};

const getErrorMessage = (error: any) => {
  if (error?.cause?.code === "SELF_SIGNED_CERT_IN_CHAIN") {
    return "Не удалось проверить сертификат OpenAI. Запустите приложение с Node.js --use-system-ca или NODE_USE_SYSTEM_CA=1.";
  }
  return error?.message || "Неизвестная ошибка AI-сервиса";
};

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], systemPrompt = "" } = req.body;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Поле message обязательно." });
    }
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "Поле history должно быть массивом." });
    }
    const customApiKey = req.headers["x-api-key"] as string | undefined;
    const openai = getOpenAIClient(customApiKey);
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.filter((h: any) => h && Array.isArray(h.parts) && h.parts[0]?.text).map((h: any) => ({
        role: h.role === "model" ? "assistant" : h.role,
        content: h.parts[0].text
      })),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      temperature: 0.8,
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Chat error:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "На вашем счету OpenAI закончились средства или превышен лимит. Проверьте: https://platform.openai.com/settings/organization/billing" });
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { transcript, context } = req.body;
    if (typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({ error: "Поле transcript обязательно." });
    }
    const customApiKey = req.headers["x-api-key"] as string | undefined;
    const openai = getOpenAIClient(customApiKey);
    
    const prompt = `Анализируй следующий ответ пользователя в контексте упражнения: "${transcript}"
Контекст: ${JSON.stringify(context)}

Верни структурированный JSON с анализом.
Используй схему:
{
  "summary": string,
  "scores": {
    "logic": number (0-10),
    "evidence": number (0-10),
    "structure": number (0-10),
    "counterargument": number (0-10),
    "ethos": number (0-10),
    "pathos": number (0-10),
    "style": number (0-10)
  },
  "strengths": string[],
  "weaknesses": string[],
  "fallacies": [{ "name": string, "severity": "low" | "medium" | "high", "explanation": string }],
  "improvedVersion": string,
  "nextChallenge": string
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that responds in JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (error: any) {
    console.error("Analysis error:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "Ошибка лимитов OpenAI (429). Пополните баланс в панели управления OpenAI." });
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

app.post("/api/transcribe", async (req, res) => {
  let tempFilePath = "";
  try {
    const { audioData, mimeType = "audio/webm" } = req.body; // base64
    if (typeof audioData !== "string" || !audioData) {
      return res.status(400).json({ error: "Поле audioData обязательно." });
    }
    const customApiKey = req.headers["x-api-key"] as string | undefined;
    const openai = getOpenAIClient(customApiKey);
    
    const buffer = Buffer.from(audioData, "base64");
    // Extract base extension from mimeType (e.g., "audio/webm;codecs=opus" -> "webm")
    const ext = mimeType.split(";")[0].split("/")[1] || "webm";
    tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);
    fs.writeFileSync(tempFilePath, buffer);

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Transcription error:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "Лимиты OpenAI исчерпаны. Транскрипция невозможна." });
    }
    res.status(500).json({ error: getErrorMessage(error) });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

app.post("/api/speech", async (req, res) => {
  try {
    const { text, voice = "alloy" } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Поле text обязательно." });
    }
    const customApiKey = req.headers["x-api-key"] as string | undefined;
    const openai = getOpenAIClient(customApiKey);
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as any,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.json({ audioData: buffer.toString("base64") });
  } catch (error: any) {
    console.error("Speech error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
