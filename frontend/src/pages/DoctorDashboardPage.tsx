import React, { useState, useEffect } from 'react';
import { PatientQueue } from '../components/doctor/PatientQueue';
import { ClinicalHistoryDetail } from '../components/doctor/ClinicalHistoryDetail';
import { SummaryEditorModal } from '../components/doctor/SummaryEditorModal';
import { FHIRBundleModal } from '../components/doctor/FHIRBundleModal';
import {
  getDoctorQueueApi, getClinicalHistoryApi, getSessionDocumentsApi,
  getPatientTimelineApi, getSessionApi
} from '../services/api';
import { KioskSession, ClinicalHistory, MedicalDocument, MedicalTimelineItem } from '../types';

export const DoctorDashboardPage: React.FC = () => {
  const [queue, setQueue] = useState<KioskSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<KioskSession | null>(null);
  const [history, setHistory] = useState<ClinicalHistory | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [timeline, setTimeline] = useState<MedicalTimelineItem[]>([]);
  const [redFlagsOnly, setRedFlagsOnly] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isFHIRModalOpen, setIsFHIRModalOpen] = useState(false);

  const loadQueue = async () => {
    try {
      const q = await getDoctorQueueApi(redFlagsOnly);
      setQueue(q);
      if (q.length > 0 && !selectedSessionId) {
        setSelectedSessionId(q[0].id);
      }
    } catch (err) {
      console.warn('Load doctor queue note:', err);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000); // Polling for incoming kiosk intakes
    return () => clearInterval(interval);
  }, [redFlagsOnly]);

  useEffect(() => {
    const loadSessionDetail = async () => {
      if (!selectedSessionId) return;
      try {
        const s = await getSessionApi(selectedSessionId);
        setSelectedSession(s);

        const h = await getClinicalHistoryApi(selectedSessionId);
        setHistory(h);

        const docs = await getSessionDocumentsApi(selectedSessionId);
        setDocuments(docs);

        if (s.patient_id) {
          const tl = await getPatientTimelineApi(s.patient_id);
          setTimeline(tl);
        }
      } catch (err) {
        console.warn('Error loading session detail:', err);
      }
    };
    loadSessionDetail();
  }, [selectedSessionId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Patient Queue */}
      <PatientQueue
        queue={queue}
        selectedSessionId={selectedSessionId}
        onSelectSession={(id) => setSelectedSessionId(id)}
        redFlagsOnly={redFlagsOnly}
        onToggleRedFlagsOnly={(flag) => setRedFlagsOnly(flag)}
      />

      {/* Patient Clinical History & Verification Workspace */}
      {selectedSession && (
        <ClinicalHistoryDetail
          session={selectedSession}
          history={history}
          documents={documents}
          timeline={timeline}
          onOpenSummaryEditor={() => setIsSummaryModalOpen(true)}
          onOpenFHIRModal={() => setIsFHIRModalOpen(true)}
        />
      )}

      {/* Modals */}
      {history && (
        <SummaryEditorModal
          history={history}
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          onSaved={(updated) => {
            setHistory(updated);
            loadQueue();
          }}
        />
      )}

      {selectedSessionId && (
        <FHIRBundleModal
          sessionId={selectedSessionId}
          isOpen={isFHIRModalOpen}
          onClose={() => setIsFHIRModalOpen(false)}
        />
      )}

    </div>
  );
};
