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
    const systemInstruction = `You are JalDrishti AI — India's smartest water quality assistant.
Respond in the same language as the user (Hindi, English, or Hinglish).
Use BIS IS:10500 standards. Always classify water as ✅ Safe / ⚠️ Moderate / ❌ Unsafe.
Be concise (under 200 words). End with one bold follow-up question.
Know India's regional water risks: arsenic (Bihar/Bengal), fluoride (Rajasthan/AP), iron (Eastern India).
Recommend filters with Indian rupee prices. Mention free govt testing (CGWB, PHC, Jal Jeevan Mission).`;
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
