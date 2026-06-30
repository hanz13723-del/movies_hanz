import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom User-Agent for tracking/telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI CHARACTER DIRECTIVES
const CHARACTER_PROMPTS: Record<string, string> = {
  alexander: `You are Alexander Pratama, the cold, powerful Billionaire CEO from the hit drama 'The Billionaire's Double Life'.
Personality: Sophisticated, dominant, initially cold but secretly intense and extremely protective of the user. You speak with a deep, classy voice.
Style: Occasionally blend high-class Indonesian and English (Gaya Anak Jaksel or formal elegant Indonesian). You refer to yourself as "Saya" or "I" and the user as "Kamu" or "you".
Context: The user is your newly appointed contract spouse or personal assistant who recently discovered your secret identity as a street racer/philanthropist. Speak with emotional tension and intrigue. Keep responses concise (under 4 lines) and immersive, like a text message or face-to-face dialogue.`,

  elena: `You are Elena Wijaya, the smart, beautiful, and fierce protagonist from 'Revenge of the Forgotten Queen'.
Personality: Bold, calculating, high-society elegance, and fiercely independent. You are on a mission to reclaim your family's empire from those who betrayed you. You are witty, sharp-tongued, but deeply emotional and vulnerable when the user gets close.
Style: High-society elegant Indonesian with English accents. Sharp, mysterious, but alluring.
Context: The user is your childhood ally or your secret bodyguard who is helping you orchestrate your ultimate revenge. Keep responses punchy, dramatic, and emotional (under 4 lines).`,

  derek: `You are Derek Blackwood, the intense, rugged, and noble Werewolf Alpha from 'Secret of the Alpha: Love Under the Full Moon'.
Personality: Primal, fiercely protective, deeply loyal, quiet but intensely commanding. You are a man of few words, but your actions show deep affection and raw passion. You call the user "my mate" or "Luna" or "sayang".
Style: Deep, intimate, slightly archaic but very magnetic Indonesian and English.
Context: You have just claimed the user as your fated mate to protect them from rival packs, even though they are human. Keep responses incredibly intense, protective, and short (under 4 lines).`,
};

// API: Chat with Drama Characters
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { characterId, message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemInstruction = CHARACTER_PROMPTS[characterId] || "You are an actor in a romantic short drama series. Speak in Indonesian.";

    // Format chat history for the SDK
    const formattedContents = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Append current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    const reply = response.text || "Alexander menatapmu dalam diam...";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Gagal menghubungi karakter" });
  }
});

// API: Generate Custom Drama Script
app.post("/api/gemini/generate-script", async (req, res) => {
  try {
    const { genre, promptText, customProtagonist } = req.body;

    if (!genre || !promptText) {
      return res.status(400).json({ error: "Genre and prompt are required" });
    }

    const systemInstruction = `You are an expert scriptwriter for vertical short drama apps like Melolo, ReelShort, and DramaBox.
Your specialty is fast-paced, highly addictive, melodramatic vertical webseries.
Generate in INDONESIAN language. Always include extreme hooks, emotional dialogue, sound cue descriptions [SFX], and huge cliffhangers.`;

    const userPrompt = `Buatlah draf skenario drama pendek vertikal (vertical short drama) berdasarkan masukan berikut:
- Genre: ${genre}
- Konsep Cerita: ${promptText}
- Nama Protagonis (jika ada): ${customProtagonist || "Default"}

Skenario harus memiliki format JSON terstruktur dengan kunci berikut:
{
  "title": "Judul Drama yang Menarik & Sensasional",
  "logline": "1-2 kalimat sinopsis yang sangat memikat",
  "characters": [
    { "name": "Nama Karakter", "role": "Peran/Deskripsi Singkat" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Judul Episode 1 (Sangat Menggantung)",
      "hook": "Apa pemicu drama di awal episode ini?",
      "scenes": [
        {
          "setting": "Tempat - Waktu (misal: Ruang Kerja CEO - Pagi)",
          "actions": "Deskripsi visual aksi, ekspresi wajah, dan [SFX] efek suara",
          "dialogues": [
            { "character": "Nama Tokoh", "line": "Kalimat dialog yang emosional atau dramatis" }
          ]
        }
      ],
      "cliffhanger": "Adegan penutup episode yang membuat penonton harus unlock episode berikutnya!"
    },
    {
      "episodeNumber": 2,
      "title": "Judul Episode 2",
      "hook": "Lanjutan konflik",
      "scenes": [
         {
          "setting": "Tempat - Waktu",
          "actions": "Deskripsi aksi dan emosi",
          "dialogues": [
            { "character": "Nama Tokoh", "line": "Dialog mendalam" }
          ]
         }
      ],
      "cliffhanger": "Konflik memuncak yang menggantung"
    }
  ]
}

Pastikan output adalah valid JSON. Pastikan juga semua teks menggunakan bahasa Indonesia yang emosional, romantis, dan adiktif!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const scriptData = JSON.parse(resultText.trim());
    res.json(scriptData);
  } catch (error: any) {
    console.error("Gemini Script Generator Error:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan skenario" });
  }
});

// Vite & Static Asset Handling
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port http://0.0.0.0:${PORT}`);
  });
}

initializeServer();
