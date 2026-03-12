import { GoogleGenAI } from "@google/genai";

export const getAiInstance = () => {
  // Try to get the key from Vite env (for Vercel), then process.env (for AI Studio), then fallback
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyDrlBNp75rLAZ5JuMu4EcljMPk1NjmNMDA';
  return new GoogleGenAI({ apiKey });
};

export const rotateKey = () => {
  console.log(`[JalDrishti INFO] Key rotation is managed by the platform.`);
};

export const handleGeminiError = (error: any) => {
  console.error('[JalDrishti ERROR] Gemini API Error:', error);
  return false;
};
