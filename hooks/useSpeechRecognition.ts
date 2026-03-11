import { useState, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export const useSpeechRecognition = (language: 'en' | 'hi', onFinalResult: (text: string) => void, showToast: (msg: string) => void) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      showToast("Voice not supported in this browser — use Chrome");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language === "hi" ? "hi-IN" : "en-IN";

    rec.onstart = () => setVoiceState("listening");
    rec.onend = () => {
      setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") showToast("Microphone access denied");
      if (e.error === "no-speech") showToast("No speech detected — try again");
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2000);
    };
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript).join("");
      setLiveTranscript(transcript);
      if (e.results[0].isFinal) {
        onFinalResult(transcript);
      }
    };

    setRecognition(rec);
  }, [language, onFinalResult, showToast]);

  const startListening = () => {
    if (recognition) {
      setLiveTranscript('');
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return { voiceState, setVoiceState, liveTranscript, startListening, stopListening };
};
