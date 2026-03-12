import { GoogleGenAI } from "@google/genai";

export const getAiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const rotateKey = () => {
  console.log(`[JalDrishti INFO] Key rotation is managed by the platform.`);
};

export const handleGeminiError = (error: any) => {
  console.error('[JalDrishti ERROR] Gemini API Error:', error);
  return false;
};
