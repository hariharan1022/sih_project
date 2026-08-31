import React, { useState, useEffect, useCallback } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isFHIRModalOpen, setIsFHIRModalOpen] = useState(false);

  const loadSessionDetail = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    try {
      const s = await getSessionApi(sessionId);
      setSelectedSession(s);

      try {
        const h = await getClinicalHistoryApi(sessionId);
        setHistory(h);
      } catch (historyErr) {
        // Patient session might still be answering interview questions
        setHistory(null);
      }

      const docs = await getSessionDocumentsApi(sessionId);
      setDocuments(docs);

      if (s.patient_id) {
        const tl = await getPatientTimelineApi(s.patient_id);
        setTimeline(tl);
      }
    } catch (err) {
      console.warn('Error loading session detail:', err);
    }
  }, []);

  const loadQueue = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const q = await getDoctorQueueApi(redFlagsOnly);
      setQueue(q);

      setSelectedSessionId(prevId => {
        if (!prevId && q.length > 0) {
          return q[0].id;
        }
        return prevId;
      });
    } catch (err) {
      console.warn('Load doctor queue note:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [redFlagsOnly]);

  // Initial fetch and 3-second real-time live synchronization loop
  useEffect(() => {
    loadQueue(false);
    const interval = setInterval(() => {
      loadQueue(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  // Sync session details whenever selectedSessionId changes or during sync loop
  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetail(selectedSessionId);
    }
  }, [selectedSessionId, loadSessionDetail]);

  const handleManualRefresh = () => {
    loadQueue(false);
    if (selectedSessionId) {
      loadSessionDetail(selectedSessionId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Patient Queue with Real-time Sync Controls */}
      <PatientQueue
        queue={queue}
        selectedSessionId={selectedSessionId}
        onSelectSession={(id) => {
          setSelectedSessionId(id);
          loadSessionDetail(id);
        }}
        redFlagsOnly={redFlagsOnly}
        onToggleRedFlagsOnly={(flag) => setRedFlagsOnly(flag)}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
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

      {/* Verification Summary Editor Modal */}
      {history && (
        <SummaryEditorModal
          history={history}
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          onSaved={(updated) => {
            setHistory(updated);
            handleManualRefresh();
          }}
        />
      )}

      {/* FHIR Bundle Viewer Modal */}
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

