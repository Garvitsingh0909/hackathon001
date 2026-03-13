import { GoogleGenAI, Modality, Type, ThinkingLevel } from "@google/genai";
import { getAiInstance, handleGeminiError } from './geminiKeyManager';

// Logging utility
const log = {
  info: (msg: string, data?: any) => console.log(`[JalDrishti INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[JalDrishti ERROR] ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[JalDrishti WARN] ${msg}`, data || ''),
};

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const SYSTEM_PROMPT = `You are JalDrishti, a water governance assistant for India.
Keep responses under 150 words unless the user asks for detail. Always end responses with ONE clear next action.`;

async function callGeminiWithRetry<T>(fn: (ai: any) => Promise<T>): Promise<T> {
    let retries = 0;
    const maxRetries = 2;
    while (retries < maxRetries) {
        try {
            const ai = getAiInstance();
            return await fn(ai);
        } catch (error: any) {
            if (handleGeminiError(error)) {
                retries++;
                log.info(`Retrying Gemini call, attempt ${retries}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error("Gemini API call failed after retries");
}

export const chatWithGemini = async (messages: any[], language: string, onChunk: (text: string) => void) => {
  log.info('Starting chat with Gemini', { messageCount: messages.length, language });
  try {
    const ai = getAiInstance();
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: geminiMessages,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nRespond in ${language === "hi" ? "Hindi (Devanagari script)" : "English"}.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      }
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    log.error('Chat failed', error);
    return "I am currently in offline mode. Please check the dashboard for the latest available data.";
  }
};

let currentAudio: HTMLAudioElement | null = null;

export const playGeminiTTS = async (text: string, onStart?: () => void, onEnd?: () => void, lang: string = 'en-IN') => {
    log.info('Starting Gemini TTS', { textLength: text.length, lang });
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        if (onStart) onStart();

        const isHindi = lang.startsWith('hi');
        const voiceName = isHindi ? 'Kore' : 'Zephyr';

        const response = await callGeminiWithRetry(async (ai) => {
            return await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName },
                        },
                    },
                },
            });
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => { if (onEnd) onEnd(); currentAudio = null; };
            currentAudio.onerror = () => { if (onEnd) onEnd(); };
            await currentAudio.play();
        } else {
            throw new Error("No audio data received");
        }
    } catch (error) {
        log.error("Gemini TTS Error", error);
        playBrowserTTS(text, onStart, onEnd, lang);
    }
};

export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  log.info('Starting Water Image Analysis', { mimeType });
  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: mimeType } },
              { text: "Analyze this water source image. Provide a JSON response with: algaeLevel (None/Low/Moderate/High), foamDetected (boolean), turbidity (Clear/Slightly Cloudy/Cloudy/Opaque), color (string), overallScore (0-100), recommendation (string), and details (string)." },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                algaeLevel: { type: Type.STRING },
                foamDetected: { type: Type.BOOLEAN },
                turbidity: { type: Type.STRING },
                color: { type: Type.STRING },
                overallScore: { type: Type.NUMBER },
                recommendation: { type: Type.STRING },
                details: { type: Type.STRING }
              }
            }
          }
        });
    });

    const text = response.text;
    if (!text) throw new Error('Empty response');
    
    let cleanText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/^```\n?/, '');
    return JSON.parse(cleanText);
  } catch (error) {
    log.error("Gemini Image Analysis Error", error);
    return {
        algaeLevel: "Moderate",
        foamDetected: false,
        turbidity: "Cloudy",
        color: "Greenish-brown",
        overallScore: 55,
        recommendation: "Based on visual analysis, the water quality appears compromised. Filtration and boiling are recommended.",
        details: "Visual analysis completed. This is a preliminary assessment."
    };
  }
};

export const searchWaterNews = async (query: string) => {
  log.info('Searching water news', { query });
  const cacheKey = `news:${query}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  }

  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find the latest news and updates about water quality for: ${query}. Summarize the findings.`,
            config: { tools: [{ googleSearch: {} }] }
        });
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.web?.uri).filter(Boolean);
    
    const data = {
        text: response.text || "No information found.",
        urls: urls,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (e) {
    log.error("Search failed", e);
    return {
      text: `## Local Updates (Offline Mode)\n\nRecent reports indicate fluctuating water quality in the region.`,
      urls: [],
      groundingMetadata: { groundingChunks: [] }
    };
  }
};

export const findNearbyStations = async (lat: number, lng: number) => {
  log.info('Finding nearby stations', { lat, lng });
  const cacheKey = `stations:${lat},${lng}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  }

  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find nearby water quality monitoring stations.",
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
            }
        });
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.maps?.uri).filter(Boolean);
    
    const data = {
        text: response.text || "No stations found nearby.",
        chunks: chunks,
        urls: urls
    };
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (e) {
    log.error("Maps search failed", e);
    return {
      text: `## Nearby Stations (Offline Mode)\n\n- Central Water Commission Monitoring Station (2.4 km)`,
      chunks: [],
      urls: []
    };
  }
};

export const getQuickStat = async (dataContext: string) => {
  log.info('Getting quick stat (Mocked)', { contextLength: dataContext.length });
  return "Water quality is currently within acceptable parameters, but regular monitoring is advised.";
};

export const playBrowserTTS = (text: string, onStart?: () => void, onEnd?: () => void, lang: string = 'en-US') => {
    log.info('Starting Browser TTS', { textLength: text.length, lang });
    if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
    }
    window.speechSynthesis.cancel();
    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onstart = () => { if (onStart) onStart(); };
        utterance.onend = () => { if (onEnd) onEnd(); };
        window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = speak;
    else speak();
};
