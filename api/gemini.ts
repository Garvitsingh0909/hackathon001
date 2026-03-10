import express from 'express';
import { GoogleGenAI, Modality } from "@google/genai";

const router = express.Router();

function getAI(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
    return new GoogleGenAI({ apiKey });
}

const MODELS = {
    IMAGE_ANALYSIS: 'gemini-2.5-flash',
    CHAT: 'gemini-2.5-flash',
    SEARCH: 'gemini-2.5-flash',
    FAST: 'gemini-2.5-flash',
    TRANSCRIPTION: 'gemini-2.5-flash',
    TTS: 'gemini-2.5-flash-preview-tts',
};

router.post('/api/gemini/analyze-image', async (req, res) => {
    const { base64Image, mimeType = 'image/jpeg' } = req.body;
    if (!base64Image) { res.status(400).json({ error: 'base64Image is required' }); return; }
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODELS.IMAGE_ANALYSIS,
            contents: [{
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: `Analyze this water sample image for eutrophication and pollution. 
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
            Return ONLY valid JSON. Do not include markdown code blocks.` }
                ]
            }],
            config: { responseMimeType: "application/json" }
        });
        const text = response.text || "{}";
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error: any) {
        console.error('analyze-image error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/gemini/chat', async (req, res) => {
    const { history = [], message } = req.body;
    if (!message) { res.status(400).json({ error: 'message is required' }); return; }
    const systemInstruction = `You are JalDrishti, an AI water governance assistant for India.

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
Keep responses under 150 words unless the user asks for detail.`;
    try {
        const ai = getAI();
        const chat = ai.chats.create({
            model: MODELS.CHAT,
            history,
            config: { systemInstruction }
        });
        const result = await chat.sendMessage({ message });
        res.json({ text: result.text });
    } catch (error: any) {
        console.error('chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/gemini/search', async (req, res) => {
    const { query } = req.body;
    if (!query) { res.status(400).json({ error: 'query is required' }); return; }
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODELS.SEARCH,
            contents: `Find the latest news and updates regarding: ${query}. Summarize the key points relevant to water quality and environmental impact.`,
            config: { tools: [{ googleSearch: {} }] }
        });
        res.json({ text: response.text, groundingMetadata: response.candidates?.[0]?.groundingMetadata });
    } catch (error: any) {
        console.error('search error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/gemini/tts', async (req, res) => {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: 'text is required' }); return; }
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODELS.TTS,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        res.json({ base64Audio });
    } catch (error: any) {
        console.error('tts error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/gemini/transcribe', async (req, res) => {
    const { base64Audio, mimeType = 'audio/wav' } = req.body;
    if (!base64Audio) { res.status(400).json({ error: 'base64Audio is required' }); return; }
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODELS.TRANSCRIPTION,
            contents: [{
                parts: [
                    { inlineData: { mimeType, data: base64Audio } },
                    { text: "Transcribe this audio." }
                ]
            }]
        });
        res.json({ text: response.text });
    } catch (error: any) {
        console.error('transcribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/gemini/quick-stat', async (req, res) => {
    const { dataContext } = req.body;
    if (!dataContext) { res.status(400).json({ error: 'dataContext is required' }); return; }
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODELS.FAST,
            contents: `Given this data context: ${dataContext}. Provide a 1-sentence quick summary of the water health status.`,
        });
        res.json({ text: response.text });
    } catch (error: any) {
        console.error('quick-stat error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
