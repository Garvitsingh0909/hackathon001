import { GoogleGenAI } from "@google/genai";

export const getAiInstance = () => {
  // Use ONLY the old API key as requested
  const apiKey = 'AIzaSyDrlBNp75rLAZ5JuMu4EcljMPk1NjmNMDA';
  return new GoogleGenAI({ apiKey });
};

export const rotateKey = () => {
  console.log(`[JalDrishti INFO] Key rotation is managed by the platform.`);
};

export const handleGeminiError = (error: any) => {
  console.error('[JalDrishti ERROR] Gemini API Error:', error);
  return false;
};
