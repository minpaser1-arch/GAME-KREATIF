import React, { useEffect, useState } from 'react';
import {
  Play,
  Sparkles,
  BookOpen,
  Archive,
  BarChart3,
  Settings,
  Star,
  Trophy,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { SchoolProfile, GameSession } from '../types/index.ts';

interface DashboardViewProps {
  school: SchoolProfile | null;
  onNavigate: (tab: string) => void;
  onStartGameWithSet: (setId?: string) => void;
  onResumeGame: (sessionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  school,
  onNavigate,
  onStartGameWithSet,
  onResumeGame,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{
    counts: {
      totalQuestionSets: number;
      totalQuestions: number;
      totalSessions: number;
      completedSessions: number;
      activeSessions: number;
      totalSubjects: number;
    };
    teamRankings: {
      name: string;
      color: string;
      gamesPlayed: number;
      totalPoints: number;
      totalStars: number;
      correctAnswers: number;
      wrongAnswers: number;
      eliminationsCount: number;
    }[];
    recentSessions: GameSession[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReportsSummary();
      setSummaryData(data);
    } catch (err: unknown) {
      console.error('Error fetching dashboard summary:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-slate-500">Memuat data MIN 1 Paser...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center my-6">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-rose-900">Gagal Memuat Ringkasan</h3>
        <p className="text-xs text-rose-700 mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const counts = summaryData?.counts || {
    totalQuestionSets: 0,
    totalQuestions: 0,
    totalSessions: 0,
    completedSessions: 0,
    activeSessions: 0,
    totalSubjects: 5,
  };

  const teamRankings = summaryData?.teamRankings || [];
  const recentSessions = summaryData?.recentSessions || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-2">
            <span>Kurikulum Merdeka MI · Fase C</span>
            <span aria-hidden="true">·</span>
            <span>Tahun Pelajaran 2026/2027</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            SISWA KREATIF DENGAN GAME KREATIF
          </h1>

          <p className="mt-3 text-sm text-emerald-100/90 leading-relaxed">
            Platform pembelajaran berbasis permainan interaktif untuk <strong>MIN 1 PASER</strong>. 
            Mendukung latihan soal kelompok, generator soal berbantuan AI, asesmen formatif, serta rekapitulasi poin dan bintang beruntun.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playTick();
                onStartGameWithSet();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              Mulai Permainan Baru
            </button>

            <button
              onClick={() => {
                sound.playTick();
                onNavigate('generator');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Generator Soal AI
            </button>
          </div>
        </div>

        {/* Hero Background Illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 lg:opacity-35 pointer-events-none overflow-hidden hidden sm:block">
          <img
            src="/src/assets/images/hero_classroom_1790734120719.jpg"
            alt="Suasana Belajar MIN 1 Paser"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-transparent"></div>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Statistik & Aktivitas Belajar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Paket Soal</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {counts.totalQuestionSets}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Tersedia di bank</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Butir Soal</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {counts.totalQuestions}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">5 Mata Pelajaran</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Sesi Dimainkan</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {counts.totalSessions}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Total di kelas</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Selesai & Arsip</span>
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">
              {counts.completedSessions}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-1">Telah direkap</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Sesi Aktif</span>
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {counts.activeSessions}
            </span>
            <span className="text-[11px] text-amber-600 block mt-1">Dapat dilanjutkan</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Kelompok Belajar</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">8</span>
            <span className="text-[11px] text-slate-400 block mt-1">Garuda s/d Bintang</span>
          </div>

        </div>
      </div>

      {/* QUICK ACTIONS BENTO ROW */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Akses Cepat Modul Pembelajaran
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <button
            onClick={() => {
              sound.playTick();
              onNavigate('generator');
            }}
            className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-900">Generator AI</span>
            <span className="text-xs text-slate-500 mt-1">
              Buat soal otomatis berbasis kurikulum dengan Gemini
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick();
              onNavigate('bank_soal');
            }}
            className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-900">Bank Soal</span>
            <span className="text-xs text-slate-500 mt-1">
              Kelola butir soal dan buat paket asesmen formatif
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick();
              onNavigate('reports');
            }}
            className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-900">Rekap Nilai & Cetak</span>
            <span className="text-xs text-slate-500 mt-1">
              Laporan resmi, ekspor CSV, dan raport cetak
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTick();
              onNavigate('settings');
            }}
            className="flex flex-col items-start p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-900">Pengaturan</span>
            <span className="text-xs text-slate-500 mt-1">
              Kelola tahun pelajaran, semester, profil madrasah
            </span>
          </button>

        </div>
      </div>

      {/* TWO COLUMN GRID: TEAM LEADERBOARD & RECENT GAMES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: 8 TEAMS STANDINGS (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Papan Peringkat Kumulatif 8 Kelompok
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi perolehan poin dan bonus 5 bintang selama sesi pembelajaran berlangsung
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Lihat Detail →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-3">Kelompok</th>
                  <th className="py-2 px-2 text-center">Permainan</th>
                  <th className="py-2 px-3 text-right">Poin</th>
                  <th className="py-2 px-3 text-right">Bintang</th>
                  <th className="py-2 px-3 text-right">Akurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamRankings.map((t, idx) => {
                  const totalAns = t.correctAnswers + t.wrongAnswers;
                  const accuracy = totalAns > 0 ? Math.round((t.correctAnswers / totalAns) * 100) : 0;
                  return (
                    <tr key={t.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-slate-700 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="font-semibold text-slate-900">Kelompok {t.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 tabular-nums">
                        {t.gamesPlayed} kali
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 tabular-nums">
                        {t.totalPoints}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-600 tabular-nums">
                        ★ {t.totalStars}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                        {accuracy}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aturan: +10 poin/jawaban benar · Bonus 5 bintang tiap kelipatan 5 streak · Gugur di 3 kesalahan beruntun</span>
          </div>
        </div>

        {/* RIGHT: RECENT SESSIONS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-600" />
                Permainan Terbaru
              </h3>
              <button
                onClick={() => onNavigate('archive')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Semua →
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Belum ada sesi permainan yang tercatat.
                <button
                  onClick={() => onStartGameWithSet()}
                  className="mt-3 block mx-auto text-emerald-700 font-semibold hover:underline"
                >
                  Mulai Permainan Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {s.title}
                      </span>
                      {s.status === 'active' ? (
                        <span className="text-amber-700 font-semibold text-[11px]">● Berlangsung</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">✔ Selesai</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{s.subjectName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.questions.length} Soal</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">
                        {new Date(s.startedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {s.status === 'active' ? (
                        <button
                          onClick={() => onResumeGame(s.id)}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          Lanjutkan Sesi →
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('archive')}
                          className="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Lihat Hasil
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onStartGameWithSet()}
              className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Buka Arena Baru di Kelas
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
