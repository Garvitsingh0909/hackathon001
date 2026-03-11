import { useEffect } from 'react';

export const useTTS = (language: 'en' | 'hi', onEnd: () => void) => {
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    window.speechSynthesis.cancel(); // stop any current speech
    window.speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      onEnd();
    };
  };

  const stop = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, stop };
};
