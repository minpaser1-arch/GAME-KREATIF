/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { PrintableReport } from './components/PrintableReport.tsx';

import { DashboardView } from './views/DashboardView.tsx';
import { GameArenaView } from './views/GameArenaView.tsx';
import { GameSetupView } from './views/GameSetupView.tsx';
import { AiGeneratorView } from './views/AiGeneratorView.tsx';
import { QuestionBankView } from './views/QuestionBankView.tsx';
import { ArchiveView } from './views/ArchiveView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

import { api } from './lib/api.ts';
import { sound } from './lib/sound.ts';
import { SchoolProfile, AcademicYear, Semester, UserProfile, GameSession } from './types/index.ts';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // School profile & Academic Context
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active Game State
  const [activeGameSession, setActiveGameSession] = useState<GameSession | null>(null);
  const [setupSetId, setSetupSetId] = useState<string | undefined>(undefined);

  // Printable Report Modal state
  const [printableSession, setPrintableSession] = useState<GameSession | null>(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      const [schoolData, ays, sems, userData, summary] = await Promise.all([
        api.getSchoolProfile(),
        api.getAcademicYears(),
        api.getSemesters(),
        api.getCurrentUser(),
        api.getReportsSummary(),
      ]);

      setSchool(schoolData);
      setAcademicYears(ays);
      setSemesters(sems);
      setCurrentUser(userData.user);

      // If there is an active session, prime it
      const activeSession = summary.recentSessions.find((s) => s.status === 'active');
      if (activeSession) {
        setActiveGameSession(activeSession);
      }
    } catch (err: unknown) {
      console.error('Failed to initialize app state:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeAcademicYear = academicYears.find((ay) => ay.isActive) || academicYears[0] || null;
  const activeSemester = semesters.find((s) => s.isActive) || semesters[0] || null;

  const handleStartGameWithSet = (setId?: string) => {
    setSetupSetId(setId);
    setActiveTab('game_setup');
  };

  const handleResumeGame = async (sessionId: string) => {
    try {
      sound.playTick();
      const session = await api.getGameSession(sessionId);
      setActiveGameSession(session);
      setActiveTab('arena');
    } catch (err: unknown) {
      console.error('Failed to resume game:', err);
      alert('Gagal memuat sesi permainan.');
    }
  };

  const handleGameCreated = (session: GameSession) => {
    setActiveGameSession(session);
    setActiveTab('arena');
  };

  const handleUpdateActiveSession = (updated: GameSession) => {
    setActiveGameSession(updated);
  };

  const handleEndGameArena = () => {
    setActiveGameSession(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-800 tracking-tight">
          SISWA KREATIF DENGAN GAME KREATIF
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Menyiapkan sistem pembelajaran MIN 1 Paser...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-emerald-200">
      
      {/* Top Header */}
      <Header
        school={school}
        activeAcademicYear={activeAcademicYear}
        activeSemester={activeSemester}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickStartGame={() => handleStartGameWithSet()}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            school={school}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartGameWithSet={handleStartGameWithSet}
            onResumeGame={handleResumeGame}
          />
        )}

        {activeTab === 'game_setup' && (
          <GameSetupView
            initialSetId={setupSetId}
            onCancel={() => setActiveTab('dashboard')}
            onGameCreated={handleGameCreated}
          />
        )}

        {activeTab === 'arena' && (
          activeGameSession ? (
            <GameArenaView
              session={activeGameSession}
              onUpdateSession={handleUpdateActiveSession}
              onEndGame={handleEndGameArena}
              onOpenPrintReport={() => setPrintableSession(activeGameSession)}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-sm">Tidak ada sesi permainan aktif.</p>
              <button
                onClick={() => handleStartGameWithSet()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Mulai Permainan Baru
              </button>
            </div>
          )
        )}

        {activeTab === 'generator' && (
          <AiGeneratorView
            onSavedToBank={() => setActiveTab('bank_soal')}
            onCreatePackFromQuestions={(ids) => {
              setActiveTab('bank_soal');
            }}
          />
        )}

        {activeTab === 'bank_soal' && (
          <QuestionBankView
            onStartGameWithSet={(setId) => handleStartGameWithSet(setId)}
            onNavigateToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            onResumeGame={handleResumeGame}
            onOpenPrintReportForSession={(session) => setPrintableSession(session)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            school={school}
            onOpenPrintReportForSession={(session) => setPrintableSession(session)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            school={school}
            onUpdateSchool={(updated) => setSchool(updated)}
            onRefreshData={initApp}
          />
        )}
      </main>

      {/* Official Printable Report Modal Overlay */}
      {printableSession && school && (
        <PrintableReport
          session={printableSession}
          school={school}
          onClose={() => setPrintableSession(null)}
        />
      )}

      {/* Footer */}
      <Footer school={school} />

    </div>
  );
}
