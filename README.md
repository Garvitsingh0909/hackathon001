# 💧 JalDrishti AI
### Water Vision — Intelligent Water Quality Platform for India

![Version](https://img.shields.io/badge/version-1.0-blue)
![Built For](https://img.shields.io/badge/built%20for-India-orange)
![Status](https://img.shields.io/badge/status-active-green)

JalDrishti AI is a bilingual, voice-first water quality intelligence platform built for Indian communities. It helps users understand water safety, analyze parameters, and get actionable recommendations — in English, Hindi, and Hinglish.

---

## 🚀 Features

- 💬 **AI Chatbot** — Answers water quality questions in English, Hindi & Hinglish
- 🎙️ **Voice Input** — Speak your question using Web Speech API
- 🧪 **Parameter Analyzer** — Enter TDS, pH, turbidity etc. and get instant Safe/Moderate/Unsafe results
- 🗺️ **Region-Aware AI** — Knows water risks per Indian state (arsenic in Bihar, fluoride in Rajasthan, etc.)
- 🔧 **Filter Advisor** — Recommends water purifiers with Indian market prices in ₹
- 📴 **Offline Support** — Rule-based AI works without API key for basic use

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **AI:** Claude API (claude-opus-4-6) / Gemini (via Firebase Functions)
- **Voice:** Web Speech API
- **Backend:** Firebase (Firestore + Auth + Cloud Functions)
- **Deployment:** Vercel

---

## 📁 Project Structure
```
jaldrishti-ai/
├── app/              # Next.js app directory
├── components/       # UI components
├── functions/        # Firebase Cloud Functions (Gemini API)
├── public/           # Static assets
├── .env              # Environment variables (never commit)
└── README.md
```

---

## ⚙️ Setup & Installation
```bash
# Clone the repo
git clone https://github.com/yourusername/jaldrishti-ai.git

# Install dependencies
cd jaldrishti-ai
npm install

# Add environment variables
cp .env.example .env
# Fill in your Firebase config and function URL

# Run locally
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in root — **add to `.gitignore` immediately**
```env
VITE_FIREBASE_API_KEY=your_key
VITE_GEMINI_FUNCTION_URL=your_url
```

> ⚠️ Never expose your Gemini API key in frontend code. Use Firebase Cloud Functions only.

---

## 🧪 Demo Values

For testing the Analyzer tab:

| Parameter | Value |
|-----------|-------|
| TDS | 850 |
| pH | 7.8 |
| Iron | 0.9 |

---

## 📱 Browser Support

| Browser | Voice Input |
|---------|------------|
| Chrome Android | ✅ Full Support |
| Firefox | ⚠️ Limited |
| Safari | ⚠️ Limited |

---k

Team: **The OG Boys**

---


---

*JalDrishti AI — Built for India • Water Vision • v1.0*
