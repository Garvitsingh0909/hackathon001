import { GoogleGenAI } from "@google/genai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

export const getAiInstance = () => {
  if (API_KEYS.length === 0) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }
  return new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
};

export const rotateKey = () => {
  if (API_KEYS.length > 0) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`[JalDrishti INFO] Rotated to Gemini API key index ${currentKeyIndex}`);
  }
};

export const handleGeminiError = (error: any) => {
  if (error?.status === 429 || error?.code === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
    console.warn('[JalDrishti WARN] Gemini quota exhausted, rotating key...');
    rotateKey();
    return true;
  }
  return false;
};
