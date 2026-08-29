import type { Language } from '../types';

export const speakText = (text: string, language: Language = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech to clear queue
  window.speechSynthesis.cancel();

  // If chrome TTS is stuck in a paused state, force resume
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Set language tag
  if (language === 'ta') {
    utterance.lang = 'ta-IN';
    utterance.rate = 0.85; // Slight reduction for perfect Tamil clear enunciation
  } else if (language === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
  } else {
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
  }

  // Bind matching voice from available browser voice list
  const voices = window.speechSynthesis.getVoices();
  const targetLangToken = language === 'ta' ? 'ta' : language === 'hi' ? 'hi' : 'en';
  const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangToken));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Handle Chrome async voices loading condition
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      const retryVoice = updatedVoices.find(v => v.lang.toLowerCase().startsWith(targetLangToken));
      if (retryVoice) {
        utterance.voice = retryVoice;
      }
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis speak error during onvoiceschanged:', err);
      }
    };
  } else {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis speak error:', err);
    }
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
