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

  const FALLBACK_QUESTIONS: Record<number, any> = {
    1: {
      question_text: "When did your symptoms start? (Onset)",
      category: "Onset",
      suggested_options: ["Less than 24 hours ago", "1-3 days ago", "1 week ago", "More than a week ago"],
      next_question_code: "Q_ONSET",
      is_complete: false
    },
    2: {
      question_text: "Where is the pain/discomfort located? (Location)",
      category: "Location",
      suggested_options: ["Chest / Left Arm", "Upper Abdomen", "Lower Back", "General head / body fatigue"],
      next_question_code: "Q_LOCATION",
      is_complete: false
    },
    3: {
      question_text: "How severe are your symptoms on a scale of 1-10? (Severity)",
      category: "Severity",
      suggested_options: ["1-3 (Mild)", "4-6 (Moderate)", "7-8 (Severe)", "9-10 (Extremely Severe)"],
      next_question_code: "Q_SEVERITY",
      is_complete: false
    },
    4: {
      question_text: "Do you have any past history of Chronic Conditions? (Past History)",
      category: "Past History",
      suggested_options: ["Hypertension (High BP)", "Diabetes mellitus", "Cardiac disease", "None of the above"],
      next_question_code: "Q_PAST_CONDITIONS",
      is_complete: true
    }
  };

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

      // Auto speak question text with a short timeout to let DOM render and stabilize
      if (res.question_text) {
        setTimeout(() => {
          speakText(res.question_text, language);
        }, 250);
      }

      if (res.is_complete || stepCount > maxSteps) {
        onCompleteInterview(updatedAnswers, detectedFlags);
      }
    } catch (err) {
      console.warn('Error fetching AI question, utilizing local fallback:', err);
      const stepIdx = Math.min(stepCount, maxSteps);
      const fallback = { ...FALLBACK_QUESTIONS[stepIdx] };

      // Localize fallback text
      if (language === 'ta') {
        if (stepIdx === 1) {
          fallback.question_text = "உங்களுக்கு மார்பில் வலி எப்போது தொடங்கியது?";
          fallback.suggested_options = ["24 மணிநேரத்திற்குள்", "1-3 நாட்களுக்கு முன்", "1 வாரத்திற்கு முன்பு", "1 வாரத்திற்கும் மேலாக"];
        } else if (stepIdx === 2) {
          fallback.question_text = "வலி/அசௌகரியம் எங்குள்ளது?";
          fallback.suggested_options = ["மார்பு / இடது கை", "மேல் வயிறு", "முதுகு பகுதி", "பொதுவான உடல் சோர்வு"];
        } else if (stepIdx === 3) {
          fallback.question_text = "உங்கள் அறிகுறிகள் எவ்வளவு தீவிரமாக உள்ளன (1-10)?";
          fallback.suggested_options = ["1-3 (லேசான)", "4-6 (மிதமான)", "7-8 (கடுமையான)", "9-10 (மிகக் கடுமையான)"];
        } else {
          fallback.question_text = "முன்பு உங்களுக்கு ஏதேனும் நோய்கள் இருந்ததா?";
          fallback.suggested_options = ["இரத்த அழுத்தம் (High BP)", "நீரிழிவு நோய் (Diabetes)", "இதய நோய் (Cardiac)", "எதுவும் இல்லை"];
        }
      } else if (language === 'hi') {
        if (stepIdx === 1) {
          fallback.question_text = "आपके लक्षण कब शुरू हुए थे?";
          fallback.suggested_options = ["24 घंटे से कम पहले", "1-3 दिन पहले", "1 सप्ताह पहले", "1 सप्ताह से अधिक पहले"];
        } else if (stepIdx === 2) {
          fallback.question_text = "दर्द / असुविधा कहाँ स्थित है?";
          fallback.suggested_options = ["छाती / बाईं बांह", "ऊपरी पेट", "पीठ का निचला हिस्सा", "सामान्य शरीर की थकान"];
        } else if (stepIdx === 3) {
          fallback.question_text = "1-10 के पैमाने पर आपके लक्षण कितने गंभीर हैं?";
          fallback.suggested_options = ["1-3 (हल्का)", "4-6 (मध्यम)", "7-8 (गंभीर)", "9-10 (अत्यंत गंभीर)"];
        } else {
          fallback.question_text = "क्या आपको पहले कभी कोई बीमारी रही है?";
          fallback.suggested_options = ["उच्च रक्तचाप (High BP)", "मधुमेह (Diabetes)", "हृदय रोग (Cardiac)", "कोई नहीं"];
        }
      }

      setCurrentQuestion(fallback);
      setTimeout(() => {
        speakText(fallback.question_text, language);
      }, 250);

      if (fallback.is_complete || stepCount > maxSteps) {
        setTimeout(() => {
          onCompleteInterview(updatedAnswers, detectedFlags);
        }, 1500);
      }
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="kiosk-card bg-white border border-slate-200 shadow-xl rounded-3xl p-8">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            <span>AI Clinical Adaptive Interview</span>
            <span>Step {Math.min(stepCount, maxSteps)} of {maxSteps}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${(Math.min(stepCount, maxSteps) / maxSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* AI Question Box */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-805">Analyzing clinical context with local Ollama Qwen3...</p>
            <p className="text-xs text-slate-500 mt-2">Formulating adaptive intake question</p>
          </div>
        ) : (
          <div>

            {/* Question Header */}
            <div className="p-6 bg-cyan-50/50 rounded-2xl border border-cyan-200/60 mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-100 text-cyan-705 rounded-xl">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 px-2.5 py-1 bg-cyan-100/50 rounded-md border border-cyan-200">
                    Category: {currentQuestion?.category || 'HPI'}
                  </span>
                </div>

                <button
                  onClick={() => speakText(currentQuestion?.question_text, language)}
                  className="p-2 rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-200 shadow-sm transition-colors cursor-pointer"
                  title="Read Aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-850 leading-snug">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Select Answer (Touch):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.suggested_options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleNextAnswer(opt)}
                      className={`p-4 rounded-xl border text-left font-bold text-base kiosk-btn transition-all ${selectedAnswer === opt
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-100'
                        : 'bg-white border-slate-205 text-slate-750 hover:border-cyan-500 hover:bg-slate-50/50'
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:bg-white focus:border-cyan-500 focus:outline-none transition-all shadow-xs"
              />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={onBack}
                className="px-6 py-4 rounded-xl border border-slate-200 text-slate-650 font-bold kiosk-btn hover:bg-slate-50 shadow-sm"
              >
                Back
              </button>

              <button
                onClick={() => handleNextAnswer(selectedAnswer)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-550 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/10 flex items-center gap-3"
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
