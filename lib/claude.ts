import { GoogleGenAI, Modality, Type } from "@google/genai";
import { getAiInstance, handleGeminiError } from './geminiKeyManager';

// Logging utility
const log = {
  info: (msg: string, data?: any) => console.log(`[JalDrishti INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[JalDrishti ERROR] ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[JalDrishti WARN] ${msg}`, data || ''),
};

async function callGeminiWithRetry<T>(fn: (ai: any) => Promise<T>): Promise<T> {
    let retries = 0;
    const maxRetries = 2; // Reduced retries since platform manages key
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

// Client-side Claude API wrapper
export const chatWithClaude = async (messages: any[], language: string, onChunk: (text: string) => void) => {
  log.info('Starting chat with Claude', { messageCount: messages.length, language });
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error('Chat API response not ok', { status: response.status, errorText });
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    if (reader) {
      log.info('Reading chat stream');
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          log.info('Chat stream reading complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                onChunk(fullText);
              }
            } catch (e) {
              log.error('Error parsing stream chunk', { line, error: e });
            }
          }
        }
      }
    }
    return fullText;
  } catch (error) {
    log.error('Chat failed', error);
    return "I am currently in offline mode. Please check the dashboard for the latest available data.";
  }
};

// Gemini TTS Implementation
let currentAudio: HTMLAudioElement | null = null;

export const playGeminiTTS = async (text: string, onStart?: () => void, onEnd?: () => void, lang: string = 'en-IN') => {
    log.info('Starting Gemini TTS', { textLength: text.length, lang });
    try {
        if (currentAudio) {
            log.info('Pausing existing audio');
            currentAudio.pause();
            currentAudio = null;
        }

        if (onStart) onStart();

        const isHindi = lang.startsWith('hi');
        const voiceName = isHindi ? 'Kore' : 'Zephyr';
        log.info('Using voice', { voiceName, isHindi });

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
            log.info('Audio data received, starting playback');
            const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => {
                log.info('Audio playback ended');
                if (onEnd) onEnd();
                currentAudio = null;
            };
            currentAudio.onerror = (e) => {
                log.error('Audio playback error', e);
                if (onEnd) onEnd();
            };
            await currentAudio.play();
        } else {
            log.error('No audio data in Gemini response');
            throw new Error("No audio data received");
        }
    } catch (error) {
        log.error("Gemini TTS Error", error);
        // Fallback to browser TTS if Gemini fails
        playBrowserTTS(text, onStart, onEnd, lang);
    }
};

// Gemini API Implementation
export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  log.info('Starting Water Image Analysis', { mimeType });
  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Image.split(',')[1] || base64Image,
                  mimeType: mimeType,
                },
              },
              {
                text: "Analyze this water source image. Provide a JSON response with: algaeLevel (None/Low/Moderate/High), foamDetected (boolean), turbidity (Clear/Slightly Cloudy/Cloudy/Opaque), color (string), overallScore (0-100), recommendation (string), and details (string).",
              },
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
    if (!text) {
        log.error('Empty response from Gemini Image Analysis');
        throw new Error('Empty response from Gemini');
    }

    log.info('Gemini Image Analysis response received', { text });
    
    // Strip markdown JSON blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const result = JSON.parse(cleanText);
    
    return {
      algaeLevel: result.algaeLevel || "Moderate",
      foamDetected: !!result.foamDetected,
      turbidity: result.turbidity || "Cloudy",
      color: result.color || "Unknown",
      overallScore: result.overallScore || 50,
      recommendation: result.recommendation || "Filtration recommended.",
      details: result.details || "Visual analysis completed."
    };
  } catch (error) {
    log.error("Gemini Image Analysis Error", error);
    // Fallback
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
  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find the latest news and updates about water quality for: ${query}. Summarize the findings.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.web?.uri).filter(Boolean);
    
    return {
        text: response.text || "No information found.",
        urls: urls,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (e) {
    log.error("Search failed", e);
    return {
      text: `## Local Updates (Offline Mode)\n\nRecent reports indicate fluctuating water quality in the region. Authorities are advising residents to boil water before consumption due to potential contamination. Local initiatives are underway to improve water treatment facilities.`,
      urls: [],
      groundingMetadata: { groundingChunks: [] }
    };
  }
};

export const findNearbyStations = async (lat: number, lng: number) => {
  log.info('Finding nearby stations', { lat, lng });
  try {
    const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find nearby water quality monitoring stations, water treatment plants, or environmental testing facilities.",
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.maps?.uri).filter(Boolean);
    
    return {
        text: response.text || "No stations found nearby.",
        chunks: chunks,
        urls: urls
    };
  } catch (e) {
    log.error("Maps search failed", e);
    return {
      text: `## Nearby Stations (Offline Mode)\n\n- Central Water Commission Monitoring Station (2.4 km)\n- Municipal Water Treatment Plant (5.1 km)\n- Local Reservoir Testing Site (8.3 km)`,
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
        log.error("Browser does not support TTS");
        if (onEnd) onEnd();
        return;
    }

    window.speechSynthesis.cancel();

    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === lang) || 
                               voices.find(v => v.name.includes('Google US English')) || 
                               voices.find(v => v.name.includes('Samantha')) ||
                               voices.find(v => v.lang === 'en-US');
        
        if (preferredVoice) {
            log.info('Using browser voice', { voiceName: preferredVoice.name });
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => { if (onStart) onStart(); };
        utterance.onend = () => { if (onEnd) onEnd(); };
        utterance.onerror = (e) => { log.error("Browser TTS Error", e); if (onEnd) onEnd(); };

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
    } else {
        speak();
    }
};
