// All AI calls are proxied through the backend to keep API keys secure server-side.

// 1. Analyze Image
export const analyzeWaterImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  try {
    const res = await fetch('/api/gemini/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, mimeType })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Analysis failed, using mock fallback:", error);
    const score = Math.floor(Math.random() * 40) + 40;
    const levels = ["Low", "Moderate", "High"] as const;
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

// 2. Chat
export const chatNormal = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    return data.text;
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

// 3. Search Grounding
export const searchWaterNews = async (query: string) => {
  try {
    const res = await fetch('/api/gemini/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Search failed, using mock fallback:", error);
    return {
      text: "## Local Updates (Simulated)\n\n**Tamsa River Status:** Recent monitoring indicates stable water levels. Local authorities have increased sampling frequency near industrial zones.\n\n**Community Action:** Volunteer groups are organizing a cleanup drive this weekend at the City Center Ghat.",
      groundingMetadata: { groundingChunks: [] }
    };
  }
};

// 4. Maps Grounding — still mock as Maps tool requires special config
export const findNearbyStations = async (_lat: number, _lng: number) => {
  return {
    text: "Found 3 monitoring stations near your location (Simulated).",
    chunks: [
      { maps: { title: "Central Water Station", uri: "https://maps.google.com" } },
      { maps: { title: "River Ghat Sensor Array", uri: "https://maps.google.com" } },
      { maps: { title: "Eco-Park Monitoring Point", uri: "https://maps.google.com" } }
    ]
  };
};

// 5. Text to Speech
export const generateSpeech = async (text: string) => {
  const res = await fetch('/api/gemini/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.base64Audio;
};

// 6. Fast Response
export const getQuickStat = async (dataContext: string) => {
  try {
    const res = await fetch('/api/gemini/quick-stat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataContext })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    return data.text;
  } catch (error) {
    return "Status update unavailable.";
  }
};

// 7. Audio Transcription
export const transcribeAudio = async (base64Audio: string, mimeType: string = 'audio/wav') => {
  const res = await fetch('/api/gemini/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Audio, mimeType })
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.text;
};

// Browser Native TTS (Offline Fallback)
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
