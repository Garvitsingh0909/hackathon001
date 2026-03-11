import { useState, useEffect, useRef } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export const useSpeechRecognition = (language: 'en' | 'hi', onFinalResult: (text: string) => void, showToast: (msg: string) => void) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Use refs for callbacks to avoid re-running the effect when they change
  const onFinalResultRef = useRef(onFinalResult);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      showToastRef.current("Voice not supported in this browser — use Chrome");
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
      if (e.error === "not-allowed") showToastRef.current("Microphone access denied");
      if (e.error === "no-speech") showToastRef.current("No speech detected — try again");
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2000);
    };
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript).join("");
      setLiveTranscript(transcript);
      if (e.results[0].isFinal) {
        onFinalResultRef.current(transcript);
      }
    };

    setRecognition(rec);
  }, [language]); // Only depend on language

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
