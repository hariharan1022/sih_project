import React, { useState, useEffect } from 'react';
import { Bot, ArrowRight, Volume2, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { SpeechMic } from '../common/SpeechMic';
import { getNextAIQuestionApi } from '../../services/api';
import { speakText } from '../../services/tts';
import { Language } from '../../types';

interface AIInterviewStepProps {
  sessionId: string;
  chiefComplaint: string;
  language: Language;
  onCompleteInterview: (answers: Record<string, any>, redFlags: any[]) => void;
  onBack: () => void;
}

export const AIInterviewStep: React.FC<AIInterviewStepProps> = ({
  sessionId,
  chiefComplaint,
  language,
  onCompleteInterview,
  onBack
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepCount, setStepCount] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [detectedFlags, setDetectedFlags] = useState<any[]>([]);

  const maxSteps = 4;

  const fetchNextQuestion = async (updatedAnswers: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await getNextAIQuestionApi({
        session_id: sessionId,
        chief_complaint: chiefComplaint,
        previous_answers: updatedAnswers,
        language
      });

      setCurrentQuestion(res);

      if (res.detected_red_flags && res.detected_red_flags.length > 0) {
        setDetectedFlags((prev) => [...prev, ...res.detected_red_flags]);
      }

      // Auto speak question text
      if (res.question_text) {
        speakText(res.question_text, language);
      }

      if (res.is_complete || stepCount > maxSteps) {
        onCompleteInterview(updatedAnswers, detectedFlags);
      }
    } catch (err) {
      console.warn('Error fetching AI question:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion({});
  }, [chiefComplaint, sessionId, language]);

  const handleNextAnswer = (answerVal: string) => {
    const finalVal = answerVal || selectedAnswer || 'Not specified';
    const questionKey = currentQuestion?.next_question_code || `Q_${stepCount}`;
    const newAnswers = { ...answers, [questionKey]: finalVal };
    
    setAnswers(newAnswers);
    setSelectedAnswer('');
    setStepCount((prev) => prev + 1);

    if (stepCount >= maxSteps || currentQuestion?.is_complete) {
      onCompleteInterview(newAnswers, detectedFlags);
    } else {
      fetchNextQuestion(newAnswers);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>AI Clinical Adaptive Interview</span>
            <span>Step {Math.min(stepCount, maxSteps)} of {maxSteps}</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${(Math.min(stepCount, maxSteps) / maxSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* AI Question Box */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-lg font-bold text-white">Analyzing clinical context with local Ollama Qwen3...</p>
            <p className="text-xs text-slate-400 mt-2">Formulating SOCRATES adaptive intake question</p>
          </div>
        ) : (
          <div>
            
            {/* Question Header */}
            <div className="p-6 bg-slate-900/90 rounded-2xl border border-cyan-500/40 mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-1 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                    Category: {currentQuestion?.category || 'HPI'}
                  </span>
                </div>
                
                <button
                  onClick={() => speakText(currentQuestion?.question_text, language)}
                  className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  title="Read Aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white leading-snug">
                {currentQuestion?.question_text || 'Please provide details about your symptoms.'}
              </h3>
            </div>

            {/* Voice Speech Mic */}
            <SpeechMic
              language={language}
              onTranscript={(text) => {
                setSelectedAnswer(text);
                handleNextAnswer(text);
              }}
            />

            {/* Touch Option Chips */}
            {currentQuestion?.suggested_options && currentQuestion.suggested_options.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Select Answer (Touch):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.suggested_options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleNextAnswer(opt)}
                      className={`p-4 rounded-xl border text-left font-bold text-base kiosk-btn transition-all ${
                        selectedAnswer === opt
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input Option */}
            <div className="mb-6">
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Or type custom response here..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-cyan-200 text-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700">
              <button
                onClick={onBack}
                className="px-6 py-4 rounded-xl border border-slate-700 text-slate-300 font-bold kiosk-btn hover:bg-slate-800"
              >
                Back
              </button>

              <button
                onClick={() => handleNextAnswer(selectedAnswer)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/20 flex items-center gap-3"
              >
                <span>Next Question</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
