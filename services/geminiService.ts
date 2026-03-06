import { GoogleGenAI, Modality, Type, ThinkingLevel } from "@google/genai";
import { API_KEY, MODELS } from "../constants";

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 1. Analyze Image (Real API with Mock Fallback)
export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  if (!API_KEY) throw new Error("API Key not configured");
  try {
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_ANALYSIS,
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this water sample image for eutrophication and pollution. 
            Provide a JSON response with the following schema:
            {
                "algaeLevel": "None" | "Low" | "Moderate" | "High" | "Critical",
                "foamDetected": boolean,
                "turbidity": "Clear" | "Slightly Cloudy" | "Cloudy" | "Opaque",
                "color": string,
                "overallScore": number (0-100, where 100 is cleanest),
                "recommendation": string (short actionable advice),
                "details": string (2-3 sentences explaining the visual findings)
            }
            Return ONLY valid JSON. Do not include markdown code blocks.`
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Analysis failed, using mock fallback:", error);
    // Mock Fallback
    const score = Math.floor(Math.random() * 40) + 40; // 40-80
    const levels = ["Low", "Moderate", "High"];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const isCloudy = Math.random() > 0.5;

    return {
        algaeLevel: level,
        foamDetected: Math.random() > 0.8,
        turbidity: isCloudy ? "Cloudy" : "Slightly Cloudy",
        color: "Greenish-brown",
        overallScore: score,
        recommendation: "Based on visual analysis (Simulated), the water quality appears compromised. Filtration and boiling are strictly recommended before any use.",
        details: `Visual inspection indicates ${level.toLowerCase()} algae presence. ${isCloudy ? 'High turbidity suggests suspended solids.' : 'Water clarity is moderate.'} No immediate signs of industrial chemical runoff, but organic load is visible.`
    };
  }
};

// 2. Chat (Real API with Mock Fallback)
export const chatNormal = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const chat = ai.chats.create({
            model: MODELS.CHAT,
            history: history,
            config: {
                systemInstruction: `You are JalDrishti AI, an advanced water quality analysis tool and governance assistant for Indian users.
Follow these rules:
1. MULTI-PARAMETER DETECTION: If the user provides multiple parameters (e.g., "TDS is 800, pH is 7.2"), extract all values, provide a combined analysis report, and give an overall water quality score out of 10.
2. FOLLOW-UP MEMORY: Remember context from previous messages (e.g., location, water source) to give smarter follow-up answers.
3. TOPICS: Provide detailed, accurate advice on: DIY water testing, water for babies/infants (strict standards), cooking water, agriculture water (EC, pH), comparing RO vs UV vs UF, water storage tips, monsoon water safety, hard water problems, and ideal TDS for plants. If a user just types a number (0-9999), assume it's a TDS value and analyze it.
4. HINGLISH: Detect Hinglish patterns and respond in the same language mix as the user.
5. EXPLANATIONS: Explain concepts like TDS, pH, and hardness with simple analogies. Provide info on Jal Jeevan Mission, CGWB, and BIS IS:10500 standards when relevant.
Keep answers concise, helpful, and beautifully formatted.`
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat failed, using mock fallback:", error);
        
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "Namaste! I am JalDrishti (Offline Mode). How can I help you with water quality today?";
        }
        if (lowerMsg.includes('water') || lowerMsg.includes('quality')) {
            return "Water quality in your region is currently fluctuating. I recommend checking the latest reports in the Dashboard.";
        }
        if (lowerMsg.includes('report') || lowerMsg.includes('complain')) {
            return "You can submit a new report by going to the Analysis tab and uploading a photo of the water body.";
        }
        
        return "I am currently in offline mode. Please check the dashboard for the latest available data.";
    }
};

// 3. Search Grounding (Real API with Mock Fallback)
export const searchWaterNews = async (query: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const response = await ai.models.generateContent({
            model: MODELS.SEARCH,
            contents: `Find the latest news and updates regarding: ${query}. Summarize the key points relevant to water quality and environmental impact.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        return {
            text: response.text,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
    } catch (error) {
        console.error("Search failed, using mock fallback:", error);
        return {
            text: "## Local Updates (Simulated)\n\n**Tamsa River Status:** Recent monitoring indicates stable water levels. Local authorities have increased sampling frequency near industrial zones.\n\n**Community Action:** Volunteer groups are organizing a cleanup drive this weekend at the City Center Ghat.",
            groundingMetadata: { groundingChunks: [] }
        };
    }
};

// 4. Maps Grounding (Real API with Mock Fallback)
export const findNearbyStations = async (lat: number, lng: number) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const response = await ai.models.generateContent({
            model: MODELS.MAPS,
            contents: "Find water quality monitoring stations, river segments, or environmental offices near this location.",
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
        
        return {
            text: response.text,
            chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
    } catch (error) {
        console.error("Maps search failed, using mock fallback:", error);
        return {
            text: "Found 3 monitoring stations near your location (Simulated).",
            chunks: [
                { maps: { title: "Central Water Station", uri: "https://maps.google.com" } },
                { maps: { title: "River Ghat Sensor Array", uri: "https://maps.google.com" } },
                { maps: { title: "Eco-Park Monitoring Point", uri: "https://maps.google.com" } }
            ]
        };
    }
};

// 5. Text to Speech (Real API)
export const generateSpeech = async (text: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const response = await ai.models.generateContent({
            model: MODELS.TTS,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio;
    } catch (error) {
        console.error("TTS failed:", error);
        throw error;
    }
};

// 6. Fast Response (Real API)
export const getQuickStat = async (dataContext: string) => {
    if (!API_KEY) return "Status update unavailable (API Key missing).";
    try {
        const response = await ai.models.generateContent({
            model: MODELS.FAST,
            contents: `Given this data context: ${dataContext}. Provide a 1-sentence quick summary of the water health status.`,
        });
        return response.text;
    } catch (error) {
        return "Status update unavailable.";
    }
};

// 7. Audio Transcription (Real API)
export const transcribeAudio = async (base64Audio: string, mimeType: string = 'audio/wav') => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const response = await ai.models.generateContent({
            model: MODELS.TRANSCRIPTION,
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    {
                        text: "Transcribe this audio."
                    }
                ]
            }]
        });
        return response.text;
    } catch (error) {
        console.error("Transcription failed:", error);
        throw error;
    }
};

// Browser Native TTS (Offline Fallback)
export const playBrowserTTS = (text: string, onStart?: () => void, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
        console.error("Browser does not support TTS");
        if (onEnd) onEnd();
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to select a better voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                               voices.find(v => v.name.includes('Samantha')) ||
                               voices.find(v => v.lang === 'en-US');
        
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            if (onStart) onStart();
        };

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
    } else {
        speak();
    }
};
