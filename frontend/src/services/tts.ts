import type { Language } from '../types';

export const speakText = (text: string, language: Language = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (language === 'ta') {
    utterance.lang = 'ta-IN';
    utterance.rate = 0.9;
  } else if (language === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
  } else {
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
