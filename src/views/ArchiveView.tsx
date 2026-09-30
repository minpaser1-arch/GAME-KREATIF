import React, { useEffect, useState } from 'react';
import {
  Archive,
  Search,
  Calendar,
  Play,
  FileText,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { GameSession } from '../types/index.ts';

interface ArchiveViewProps {
  onResumeGame: (sessionId: string) => void;
  onOpenPrintReportForSession: (session: GameSession) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  onResumeGame,
  onOpenPrintReportForSession,
}) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getReportsSummary();
      setSessions(data.recentSessions || []);
    } catch (err: unknown) {
      console.error('Error fetching archive sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Archive className="w-4 h-4 text-emerald-600" />
            <span>Dokumentasi dan Jejak Rekam Asesmen</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Arsip Riwayat Permainan Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua sesi game interaktif tersimpan secara permanen untuk audit nilai, evaluasi kurikulum, dan cetak berita acara.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
          >
            <option value="">Semua Status Sesi</option>
            <option value="active">Sedang Berlangsung (Aktif)</option>
            <option value="completed">Selesai (Terekapitulasi)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-slate-500">Memuat arsip permainan...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
          Belum ada sesi permainan yang tersimpan dalam arsip.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((s) => {
            const isExpanded = selectedSession?.id === s.id;
            const topTeam = [...s.teams].sort((a, b) => b.points - a.points)[0];

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Main Card Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {s.subjectName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-600 font-medium">{s.academicYearName}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-600">{s.semesterName}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      {s.status === 'active' ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                          ● Sesi Aktif
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          ✔ Selesai
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {s.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(s.startedAt).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>{s.questions.length} Butir Soal</span>
                      <span>Guru: {s.teacherName}</span>
                      {topTeam && (
                        <span className="text-slate-800">
                          Juara / Unggul: <strong style={{ color: topTeam.color }}>Kelompok {topTeam.name}</strong> ({topTeam.points} Poin)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {s.status === 'active' ? (
                      <button
                        onClick={() => {
                          sound.playTick();
                          onResumeGame(s.id);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Lanjutkan Permainan
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playTick();
                          onOpenPrintReportForSession(s);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Rekap
                      </button>
                    )}

                    <button
                      onClick={() => {
                        sound.playTick();
                        setSelectedSession(isExpanded ? null : s);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-xs font-medium flex items-center gap-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Details: 8 Teams & Audit Event Log */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4 text-xs animate-in fade-in duration-200">
                    
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">
                        Rekapitulasi 8 Kelompok Peserta:
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {s.teams.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900" style={{ color: t.color }}>
                                {t.name}
                              </span>
                              {t.isEliminated ? (
                                <span className="text-[10px] text-rose-700 font-bold">Gugur</span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-semibold">Aktif</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>{t.points} Poin</span>
                              <span className="text-amber-600 font-bold">★ {t.stars}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Benar: {t.correctAnswers} · Salah: {t.wrongAnswers}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Audit Logs */}
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">
                        Jejak Peristiwa & Audit Skor (Total {s.events.length} Peristiwa):
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-3 rounded-xl border border-slate-200 divide-y divide-slate-100">
                        {s.events.slice().reverse().map((ev) => (
                          <div key={ev.id} className="pt-1.5 pb-1 flex items-start justify-between gap-3 text-[11px]">
                            <span className="text-slate-700">{ev.details}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                              {new Date(ev.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
