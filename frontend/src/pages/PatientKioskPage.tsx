import React, { useState } from 'react';
import { StartLanguageStep } from '../components/kiosk/StartLanguageStep';
import { IdentityStep } from '../components/kiosk/IdentityStep';
import { ConsentStep } from '../components/kiosk/ConsentStep';
import { ChiefComplaintStep } from '../components/kiosk/ChiefComplaintStep';
import { AIInterviewStep } from '../components/kiosk/AIInterviewStep';
import { AyushIntakeStep } from '../components/kiosk/AyushIntakeStep';
import { DocumentUploadStep } from '../components/kiosk/DocumentUploadStep';
import { TimelinePreviewStep } from '../components/kiosk/TimelinePreviewStep';
import { ReviewSubmitStep } from '../components/kiosk/ReviewSubmitStep';
import { SessionCompletedStep } from '../components/kiosk/SessionCompletedStep';
import { createSessionApi, recordConsentApi } from '../services/api';
import { Language, MedicalDocument } from '../types';

interface PatientKioskPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

type KioskStep =
  | 'LANGUAGE'
  | 'IDENTITY'
  | 'CONSENT'
  | 'CHIEF_COMPLAINT'
  | 'AI_INTERVIEW'
  | 'AYUSH'
  | 'DOCUMENTS'
  | 'TIMELINE'
  | 'REVIEW'
  | 'COMPLETED';

export const PatientKioskPage: React.FC<PatientKioskPageProps> = ({
  language,
  onLanguageChange
}) => {
  const [step, setStep] = useState<KioskStep>('LANGUAGE');
  const [sessionId, setSessionId] = useState<string>('');
  const [tokenNumber, setTokenNumber] = useState<string>('T-108');
  const [patientInfo, setPatientInfo] = useState<any>({
    full_name: 'Demo Patient',
    age: 45,
    gender: 'Male',
    contact_phone: '+91-9876543210'
  });
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [aiAnswers, setAiAnswers] = useState<Record<string, any>>({});
  const [ayushData, setAyushData] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<MedicalDocument[]>([]);
  const [hasRedFlags, setHasRedFlags] = useState<boolean>(false);

  const handleIdentitySubmit = async (data: any) => {
    setPatientInfo(data);
    try {
      const res = await createSessionApi({
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        contact_phone: data.contact_phone,
        language: language,
        department: 'Cardiology & Chest Medicine'
      });
      setSessionId(res.id);
      setTokenNumber(res.token_number);
      setStep('CONSENT');
    } catch (err) {
      console.warn('Session creation note:', err);
      setSessionId('demo-session-1');
      setStep('CONSENT');
    }
  };

  const handleConsentSubmit = async (agreed: boolean) => {
    if (!agreed) {
      alert('Consent is required to proceed with AI clinical intake. Please contact reception staff.');
      return;
    }
    if (sessionId) {
      await recordConsentApi(sessionId, agreed, language);
    }
    setStep('CHIEF_COMPLAINT');
  };

  const handleChiefComplaintNext = (complaint: string) => {
    setChiefComplaint(complaint);
    setStep('AI_INTERVIEW');
  };

  const handleAIInterviewComplete = (answers: Record<string, any>, flags: any[]) => {
    setAiAnswers(answers);
    if (flags && flags.length > 0) setHasRedFlags(true);
    setStep('AYUSH');
  };

  const handleAyushNext = (ayush: Record<string, any>) => {
    setAyushData(ayush);
    setStep('DOCUMENTS');
  };

  const handleDocumentUploaded = (doc: MedicalDocument) => {
    setUploadedDocs((prev) => [...prev, doc]);
  };

  const handleFinalSubmitted = (res: any) => {
    if (res.red_flags && res.red_flags.length > 0) {
      setHasRedFlags(true);
    }
    setStep('COMPLETED');
  };

  const handleReset = () => {
    setStep('LANGUAGE');
    setSessionId('');
    setChiefComplaint('');
    setAiAnswers({});
    setAyushData({});
    setUploadedDocs([]);
    setHasRedFlags(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-6">
      {step === 'LANGUAGE' && (
        <StartLanguageStep
          selectedLanguage={language}
          onSelectLanguage={onLanguageChange}
          onNext={() => setStep('IDENTITY')}
        />
      )}

      {step === 'IDENTITY' && (
        <IdentityStep
          language={language}
          onComplete={handleIdentitySubmit}
          onBack={() => setStep('LANGUAGE')}
        />
      )}

      {step === 'CONSENT' && (
        <ConsentStep
          language={language}
          onConsent={handleConsentSubmit}
          onBack={() => setStep('IDENTITY')}
        />
      )}

      {step === 'CHIEF_COMPLAINT' && (
        <ChiefComplaintStep
          language={language}
          onNext={handleChiefComplaintNext}
          onBack={() => setStep('CONSENT')}
        />
      )}

      {step === 'AI_INTERVIEW' && (
        <AIInterviewStep
          sessionId={sessionId || 'demo-session-1'}
          chiefComplaint={chiefComplaint}
          language={language}
          onCompleteInterview={handleAIInterviewComplete}
          onBack={() => setStep('CHIEF_COMPLAINT')}
        />
      )}

      {step === 'AYUSH' && (
        <AyushIntakeStep
          language={language}
          onNext={handleAyushNext}
          onSkip={() => setStep('DOCUMENTS')}
        />
      )}

      {step === 'DOCUMENTS' && (
        <DocumentUploadStep
          sessionId={sessionId || 'demo-session-1'}
          language={language}
          uploadedDocs={uploadedDocs}
          onDocumentUploaded={handleDocumentUploaded}
          onNext={() => setStep('TIMELINE')}
          onBack={() => setStep('AYUSH')}
        />
      )}

      {step === 'TIMELINE' && (
        <TimelinePreviewStep
          documents={uploadedDocs}
          language={language}
          onNext={() => setStep('REVIEW')}
          onBack={() => setStep('DOCUMENTS')}
        />
      )}

      {step === 'REVIEW' && (
        <ReviewSubmitStep
          sessionId={sessionId || 'demo-session-1'}
          patientInfo={patientInfo}
          chiefComplaint={chiefComplaint}
          answers={aiAnswers}
          ayushData={ayushData}
          uploadedDocsCount={uploadedDocs.length}
          language={language}
          onSubmitted={handleFinalSubmitted}
          onBack={() => setStep('TIMELINE')}
        />
      )}

      {step === 'COMPLETED' && (
        <SessionCompletedStep
          tokenNumber={tokenNumber}
          hasRedFlags={hasRedFlags}
          language={language}
          onResetKiosk={handleReset}
        />
      )}
    </div>
  );
};
