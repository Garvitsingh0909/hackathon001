import { GoogleGenAI, Modality, Type, ThinkingLevel } from "@google/genai";
import { API_KEY, MODELS } from "../constants";

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 1. Analyze Image (Gemini 3 Pro)
export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  if (!API_KEY) throw new Error("API Key not configured");
  try {
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_ANALYSIS,
      contents: {
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
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    // Clean up markdown if present despite instructions
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Analysis failed:", error);
    // Return a fallback result instead of crashing
    return {
        algaeLevel: "Unknown",
        foamDetected: false,
        turbidity: "Unknown",
        color: "Unknown",
        overallScore: 50,
        recommendation: "Analysis failed. Please try again with a clearer image.",
        details: "Could not process the image."
    };
  }
};

// 2. Normal Chat (Gemini 3 Flash - Fast & Capable)
export const chatNormal = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const chat = ai.chats.create({
            model: MODELS.SEARCH, // Using Flash for speed and general capability
            history: history,
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat failed:", error);
        return "I'm having trouble connecting right now. Please try again.";
    }
};

// 2.1 Chat with Thinking (Gemini 3 Pro - Optional/Advanced)
export const chatWithThinking = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const chat = ai.chats.create({
            model: MODELS.CHAT,
            history: history,
            config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } // Max thinking for deep reasoning
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat failed:", error);
        throw error;
    }
};

// 3. Search Grounding (Gemini 3 Flash)
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
        console.error("Search failed:", error);
        throw error;
    }
};

// 4. Maps Grounding (Gemini 2.5 Flash)
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
        
        // Maps tool output often contains text + grounding chunks with map URIs
        return {
            text: response.text,
            chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
    } catch (error) {
        console.error("Maps search failed:", error);
        throw error;
    }
};

// 5. Text to Speech (Gemini 2.5 Flash TTS)
export const generateSpeech = async (text: string) => {
    if (!API_KEY) throw new Error("API Key not configured");
    try {
        const response = await ai.models.generateContent({
            model: MODELS.TTS,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' is usually a good neutral voice
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

// 6. Fast Response (Gemini 2.5 Flash Lite)
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
