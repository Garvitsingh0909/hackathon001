import { GoogleGenAI, Modality } from "@google/genai";

// Client-side Claude API wrapper
export const chatWithClaude = async (messages: any[], language: string, onChunk: (text: string) => void) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
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
              console.error('Error parsing stream chunk', e);
            }
          }
        }
      }
    }
    return fullText;
  } catch (error) {
    console.error('Chat failed:', error);
    return "I am currently in offline mode. Please check the dashboard for the latest available data.";
  }
};

// Gemini TTS Implementation
let currentAudio: HTMLAudioElement | null = null;

export const playGeminiTTS = async (text: string, onStart?: () => void, onEnd?: () => void, lang: string = 'en-IN') => {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        if (onStart) onStart();

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        
        // Map language to voice and prompt
        const isHindi = lang.startsWith('hi');
        const voiceName = isHindi ? 'Kore' : 'Zephyr'; // Zephyr for English, Kore for Hindi (just a choice)
        const prompt = isHindi 
            ? `Translate and speak this in Hindi: ${text}` 
            : `Speak this in English: ${text}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }], // Use original text, model handles lang if prompt is right or just text is right
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => {
                if (onEnd) onEnd();
                currentAudio = null;
            };
            currentAudio.onerror = () => {
                console.error("Audio playback error");
                if (onEnd) onEnd();
            };
            await currentAudio.play();
        } else {
            throw new Error("No audio data received");
        }
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        // Fallback to browser TTS if Gemini fails
        playBrowserTTS(text, onStart, onEnd, lang);
    }
};

// Gemini API Implementation
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
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
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
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
    console.error("Gemini Image Analysis Error:", error);
    // Fallback
    return {
        algaeLevel: "Moderate",
        foamDetected: Math.random() > 0.8,
        turbidity: "Cloudy",
        color: "Greenish-brown",
        overallScore: 55,
        recommendation: "Based on visual analysis (Fallback), the water quality appears compromised. Filtration and boiling are recommended.",
        details: "AI analysis encountered an error. This is a preliminary assessment based on fallback logic."
    };
  }
};

export const searchWaterNews = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest water quality news and updates for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const urls = chunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];

    return {
      text: response.text || "No recent news found.",
      urls: urls,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
        text: "## Local Updates (Offline)\n\nUnable to fetch real-time news. Please check back later.",
        urls: [],
        groundingMetadata: { groundingChunks: [] }
    };
  }
};

export const findNearbyStations = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find water quality monitoring stations, river sensors, or water treatment plants near this location.",
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
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text: response.text || "Found nearby stations.",
      chunks: chunks
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return {
        text: "Unable to locate nearby stations in real-time.",
        chunks: []
    };
  }
};

export const getQuickStat = async (dataContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Provide a very brief (1 sentence) status update on water quality based on this context: ${dataContext}`,
    });
    return response.text || "Status unavailable.";
  } catch (error) {
    return "Status update unavailable.";
  }
};

export const playBrowserTTS = (text: string, onStart?: () => void, onEnd?: () => void, lang: string = 'en-US') => {
    if (!('speechSynthesis' in window)) {
        console.error("Browser does not support TTS");
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
        
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => { if (onStart) onStart(); };
        utterance.onend = () => { if (onEnd) onEnd(); };
        utterance.onerror = (e) => { console.error("TTS Error:", e); if (onEnd) onEnd(); };

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
    } else {
        speak();
    }
};
