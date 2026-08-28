import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { speakText } from '../../services/tts';
import { Language } from '../../types';

interface SpeechMicProps {
  language: Language;
  onTranscript: (text: string) => void;
  promptText?: string;
}

export const SpeechMic: React.FC<SpeechMicProps> = ({ language, onTranscript, promptText }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      
      if (language === 'ta') rec.lang = 'ta-IN';
      else if (language === 'hi') rec.lang = 'hi-IN';
      else rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInterimText(transcript);
        if (event.results[0].isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [language, onTranscript]);

  const toggleListen = () => {
    if (!recognition) {
      alert('Speech recognition is not supported on this browser. Please use touch option or type below.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInterimText('');
      recognition.start();
      setIsListening(true);
    }
  };

  const speakPrompt = () => {
    if (promptText) {
      speakText(promptText, language);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/90 rounded-2xl border border-cyan-500/30 my-4 shadow-xl">
      {promptText && (
        <div className="flex items-center gap-3 mb-4 text-cyan-200 text-lg font-medium text-center">
          <span>{promptText}</span>
          <button
            onClick={speakPrompt}
            className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            title="Read Question Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={toggleListen}
        className={`relative p-8 rounded-full transition-all duration-300 transform active:scale-90 ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/50 ring-4 ring-rose-400/30'
            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-600/30'
        }`}
      >
        {isListening ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12" />}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        )}
      </button>

      <span className="mt-3 font-semibold text-sm tracking-wide uppercase text-slate-300">
        {isListening ? 'Listening... Speak Now 🎤' : 'Tap Microphone to Speak'}
      </span>

      {interimText && (
        <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-cyan-500/40 text-cyan-300 text-center text-sm font-sans max-w-md">
          "{interimText}"
        </div>
      )}
    </div>
  );
};
