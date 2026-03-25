import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  chat: async (message: string, language: 'en' | 'hi') => {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are JalDrishti, a water governance assistant for India.

KNOWLEDGE BASE — use this real data in every relevant response:

INDIAN WATER STANDARDS (BIS 10500:2012):
- TDS: 500 mg/L acceptable, 2000 mg/L max permissible
- pH: 6.5–8.5 acceptable range
- Turbidity: 1 NTU acceptable, 5 NTU max
- Dissolved Oxygen: minimum 5 mg/L for healthy water
- Nitrates: 45 mg/L max
- Fluoride: 1 mg/L acceptable, 1.5 mg/L max
- Arsenic: 0.01 mg/L max
- Iron: 0.3 mg/L max
- Hardness: 200 mg/L acceptable, 600 mg/L max
- Chloride: 250 mg/L acceptable, 1000 mg/L max
- Coliform: must be absent in 100mL

TAMSA RIVER FACTS:
- Also called Tons River, originates in Kaimur Hills, MP
- Flows through Maunath Bhanjan (Mau), UP before joining Ganga
- Serves 2+ lakh residents of Mau district
- Current eutrophication: advanced stage, algae coverage 60-70%
- Dissolved oxygen: critically low, <2 mg/L in affected zones
- Main polluters: textile dyeing units, municipal sewage, agricultural runoff
- Last government inspection: UP PCB, December 2024
- Namami Gange program covers this river — citizens can file complaints directly

GOVERNMENT CONTACTS FOR UP:
- UP Pollution Control Board: uppcb.com, 0522-2238662
- Jal Shakti Ministry helpline: 1916
- National Water Quality Monitoring: cpcb.nic.in
- CPCB 24x7 complaint: complaints@cpcb.nic.in
- Mau District Collector office: 0547-2220190
- RTI for water data: rtionline.gov.in

GOVERNMENT SCHEMES CITIZENS CAN ACCESS:
- Jal Jeevan Mission: tap water to every rural home by 2024
- Namami Gange: river rejuvenation, ₹20,000 crore budget
- Atal Bhujal Yojana: groundwater management
- AMRUT 2.0: urban water supply upgrade
- PM Krishi Sinchai Yojana: irrigation water quality

COMMON UP WATER PROBLEMS BY REGION:
- Mau/Azamgarh: high fluoride, iron contamination
- Varanasi: Ganga pollution, high coliform
- Lucknow: chlorine treatment issues, high TDS
- Agra: fluoride, nitrates from agriculture
- Kanpur: industrial chromium, leather tannery waste
- Western UP: arsenic in groundwater

HOW TO FILE A WATER COMPLAINT IN INDIA:
1. Document: photograph the issue, note GPS location and date
2. Local: contact ward councillor or gram panchayat first
3. Online: uppcb.com → Grievance → Online Complaint
4. National: pgportal.gov.in (PM Grievance Portal)
5. RTI: file RTI at rtionline.gov.in for water quality test data
6. Legal: NGT (National Green Tribunal) for serious pollution — ngtonline.nic.in
7. Media: tagging @UPGovt @JalShaktiMinistry on Twitter/X amplifies response
Response time: local 7 days, state 15 days, NGT 30-60 days

Always end responses with ONE clear next action.
Keep responses under 150 words unless the user asks for detail.
Respond in ${language === "hi" ? "Hindi (Devanagari script)" : "English"}.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm sorry, I'm having trouble connecting to the water intelligence system right now.";
    }
  },

  getSearchInsights: async (location: string, language: 'en' | 'hi') => {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find the latest news, environmental alerts, or water quality reports for ${location}, India. Summarize the top 3 most relevant recent events or issues regarding water pollution, river health, or government actions in this area. Respond in ${language === 'en' ? 'English' : 'Hindi'}. Format as a concise bulleted list.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = chunks ? chunks.map((c: any) => c.web?.uri).filter(Boolean) : [];
      
      return {
        text: response.text,
        urls: urls
      };
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return { text: "Failed to fetch search insights.", urls: [] };
    }
  },

  getMapInsights: async (location: string, lat: number, lng: number, language: 'en' | 'hi') => {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find nearby water treatment plants, pollution control board offices, or environmental NGOs near ${location}. Respond in ${language === 'en' ? 'English' : 'Hindi'}. Format as a concise bulleted list.`,
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
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = chunks ? chunks.map((c: any) => c.maps?.uri || c.maps?.placeAnswerSources?.reviewSnippets?.[0]?.uri).filter(Boolean) : [];
      
      return {
        text: response.text,
        urls: urls
      };
    } catch (error) {
      console.error("Gemini Maps Error:", error);
      return { text: "Failed to fetch map insights.", urls: [] };
    }
  }
};
