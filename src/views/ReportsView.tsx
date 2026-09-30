import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Trophy,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { GameSession, SchoolProfile } from '../types/index.ts';

interface ReportsViewProps {
  school: SchoolProfile | null;
  onOpenPrintReportForSession?: (session: GameSession) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  school,
  onOpenPrintReportForSession,
}) => {
  const [loading, setLoading] = useState(true);
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
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReportsSummary();
      setSummaryData(data);
    } catch (err: unknown) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    sound.playTick();
    window.location.href = '/api/reports/csv';
  };

  const teamRankings = summaryData?.teamRankings || [];
  const recentSessions = summaryData?.recentSessions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Asesmen Formatif & Portofolio Belajar Siswa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laporan dan Rekapitulasi Nilai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis capaian kompetensi 8 kelompok, akumulasi poin, bonus bintang, dan unduh berkas evaluasi resmi MIN 1 Paser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh CSV Rekap Nilai
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-slate-500">Mengkalkulasi rekapitulasi data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Total Permainan</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {summaryData?.counts.totalSessions || 0}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Sesi terdata</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Rata-rata Akurasi</span>
              <span className="text-2xl font-black text-emerald-700 tabular-nums">
                {(() => {
                  let totalC = 0;
                  let totalW = 0;
                  teamRankings.forEach((t) => {
                    totalC += t.correctAnswers;
                    totalW += t.wrongAnswers;
                  });
                  const sum = totalC + totalW;
                  return sum > 0 ? Math.round((totalC / sum) * 100) : 0;
                })()}%
              </span>
              <span className="text-[11px] text-emerald-600 block mt-1">Seluruh kelompok</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Total Bonus Bintang</span>
              <span className="text-2xl font-black text-amber-500 tabular-nums">
                ★ {teamRankings.reduce((acc, t) => acc + t.totalStars, 0)}
              </span>
              <span className="text-[11px] text-amber-600 block mt-1">Dari kelipatan 5 streak</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Kejadian Eliminasi</span>
              <span className="text-2xl font-black text-rose-600 tabular-nums">
                {teamRankings.reduce((acc, t) => acc + t.eliminationsCount, 0)}
              </span>
              <span className="text-[11px] text-rose-500 block mt-1">3 kesalahan beruntun</span>
            </div>

          </div>

          {/* TABLE: 8 TEAMS COMPREHENSIVE PERFORMANCE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tabel Rekapitulasi Prestasi 8 Kelompok Siswa
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Perhitungan nilai dihitung langsung dari seluruh riwayat audit transaksi jawaban di database server.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                    <th className="py-2.5 px-3 text-center w-12">Peringkat</th>
                    <th className="py-2.5 px-3">Kelompok</th>
                    <th className="py-2.5 px-3 text-center">Permainan Diikuti</th>
                    <th className="py-2.5 px-3 text-right">Total Poin (+10)</th>
                    <th className="py-2.5 px-3 text-right">Total Bintang (★)</th>
                    <th className="py-2.5 px-3 text-right">Jawaban Benar</th>
                    <th className="py-2.5 px-3 text-right">Jawaban Salah</th>
                    <th className="py-2.5 px-3 text-right">Akurasi (%)</th>
                    <th className="py-2.5 px-3 text-center">Riwayat Eliminasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamRankings.map((t, idx) => {
                    const total = t.correctAnswers + t.wrongAnswers;
                    const accuracy = total > 0 ? Math.round((t.correctAnswers / total) * 100) : 0;

                    return (
                      <tr key={t.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-800 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="font-bold text-slate-900">Kelompok {t.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 tabular-nums">
                          {t.gamesPlayed} sesi
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-800 tabular-nums">
                          {t.totalPoints}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-600 tabular-nums">
                          ★ {t.totalStars}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                          {t.correctAnswers}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-600 font-semibold tabular-nums">
                          {t.wrongAnswers}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800 tabular-nums">
                          {accuracy}%
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 tabular-nums">
                          {t.eliminationsCount > 0 ? (
                            <span className="text-rose-700 font-semibold">{t.eliminationsCount} kali</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">0 (Nir-eliminasi)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PER-SESSION PRINT REPORT LAUNCHER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cetak Dokumen Resmi Berita Acara & Raport Permainan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih salah satu sesi di bawah untuk membuka pratinjau dokumen cetak berstandar Madrasah Ibtidaiyah Negeri 1 Paser.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      {s.subjectName} · {s.academicYearName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {s.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(s.startedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {s.questions.length} Butir Soal
                    </span>
                    <button
                      onClick={() => onOpenPrintReportForSession && onOpenPrintReportForSession(s)}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Berita Acara
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
