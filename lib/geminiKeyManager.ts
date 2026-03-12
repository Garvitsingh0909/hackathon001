import { GoogleGenAI } from "@google/genai";

export const getAiInstance = () => {
  let apiKey = '';
  
  // 1. Try platform injected key
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  // 2. Try Vite env key
  if (!apiKey) {
    try {
      const meta = import.meta as any;
      if (typeof meta !== 'undefined' && meta.env && meta.env.VITE_GEMINI_API_KEY) {
        apiKey = meta.env.VITE_GEMINI_API_KEY;
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // 3. Fallback to the user's provided key to guarantee it works
  if (!apiKey) {
    apiKey = 'AIzaSyDrlBNp75rLAZ5JuMu4EcljMPk1NjmNMDA';
    console.warn('[JalDrishti WARN] Using fallback API key.');
  }
  
  return new GoogleGenAI({ apiKey });
};

export const rotateKey = () => {
  console.log(`[JalDrishti INFO] Key rotation is managed by the platform.`);
};

export const handleGeminiError = (error: any) => {
  console.error('[JalDrishti ERROR] Gemini API Error:', error);
  return false;
};
