import React, { useState } from 'react';
import {
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  LogOut,
  Sparkles,
  Users,
  Printer,
  ChevronRight
} from 'lucide-react';
import { GameSession, GameTeam, Question } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { CelebrationModal } from '../components/CelebrationModal.tsx';

interface GameArenaViewProps {
  session: GameSession;
  onUpdateSession: (updated: GameSession) => void;
  onEndGame: () => void;
  onOpenPrintReport: () => void;
}

export const GameArenaView: React.FC<GameArenaViewProps> = ({
  session,
  onUpdateSession,
  onEndGame,
  onOpenPrintReport,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    pointsEarned: number;
    bonusStarsEarned: number;
  } | null>(null);

  // Modal celebration state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'star_bonus' | 'elimination';
    teamName: string;
    teamColor: string;
    streakCount: number;
    errorCount: number;
  }>({
    isOpen: false,
    type: 'star_bonus',
    teamName: '',
    teamColor: '#F59E0B',
    streakCount: 5,
    errorCount: 3,
  });

  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  const currentQIndex = session.currentQuestionIndex;
  const currentQ: Question | undefined = session.questions[currentQIndex];
  const activeTeam = session.teams.find((t) => t.id === session.currentTeamId) || session.teams[0];

  // Eligible active teams that are NOT eliminated
  const eligibleTeams = session.teams.filter((t) => !t.isEliminated);

  // Has this question already been answered in this session?
  const isQuestionAnswered = session.answers.some(
    (a) => a.questionId === currentQ?.id && a.questionIndex === currentQIndex
  );

  const handleSelectTeam = async (targetTeamId: string) => {
    if (submitting) return;
    const target = session.teams.find((t) => t.id === targetTeamId);
    if (target?.isEliminated) {
      alert(`Kelompok ${target.name} telah tereliminasi dan tidak dapat dipilih.`);
      return;
    }
    sound.playTick();
    try {
      const updated = await api.nextTurn(session.id, { nextTeamId: targetTeamId });
      onUpdateSession(updated);
    } catch (err: unknown) {
      console.error('Error changing team turn:', err);
    }
  };

  const handleSubmitAnswer = async (optionLetter: string) => {
    if (submitting || isQuestionAnswered || !currentQ || activeTeam.isEliminated) return;

    sound.playTick();
    setSelectedOption(optionLetter);
    setSubmitting(true);

    try {
      const res = await api.submitGameAnswer({
        sessionId: session.id,
        teamId: activeTeam.id,
        questionId: currentQ.id,
        submittedAnswer: optionLetter,
      });

      // Show immediate feedback banner
      setFeedback({
        show: true,
        isCorrect: res.isCorrect,
        correctAnswer: res.correctAnswer,
        explanation: res.explanation,
        pointsEarned: res.pointsEarned,
        bonusStarsEarned: res.bonusStarsEarned,
      });

      if (res.isCorrect) {
        sound.playCorrect();

        // Check if milestone bonus stars triggered (every 5 correct in a row)
        if (res.bonusStarsEarned > 0) {
          setTimeout(() => {
            setModalState({
              isOpen: true,
              type: 'star_bonus',
              teamName: activeTeam.name,
              teamColor: activeTeam.color,
              streakCount: res.currentStreak,
              errorCount: 0,
            });
          }, 300);
        }
      } else {
        sound.playWrong();

        // Check if elimination occurred (3 consecutive errors)
        if (res.isEliminated) {
          setTimeout(() => {
            setModalState({
              isOpen: true,
              type: 'elimination',
              teamName: activeTeam.name,
              teamColor: activeTeam.color,
              streakCount: 0,
              errorCount: 3,
            });
          }, 400);
        }
      }

      onUpdateSession(res.session);
    } catch (err: unknown) {
      console.error('Error submitting answer:', err);
      alert(err instanceof Error ? err.message : 'Gagal mengirimkan jawaban');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    sound.playTick();
    setFeedback(null);
    setSelectedOption(null);

    try {
      const updated = await api.nextTurn(session.id, { advanceQuestion: true });
      onUpdateSession(updated);
    } catch (err: unknown) {
      console.error('Error advancing question:', err);
    }
  };

  const handleConfirmEndGame = async () => {
    sound.playTick();
    try {
      const updated = await api.endGameSession(session.id);
      onUpdateSession(updated);
      setConfirmEndOpen(false);
    } catch (err: unknown) {
      console.error('Error ending game:', err);
    }
  };

  // If game is completed, show Final Podium / Leaderboard
  if (session.status === 'completed') {
    const rankedTeams = [...session.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.stars !== a.stars) return b.stars - a.stars;
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      return a.wrongAnswers - b.wrongAnswers;
    });

    const winner = rankedTeams[0];

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-300">
        
        {/* WINNER CELEBRATION CARD */}
        <div className="bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-800 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md p-3 mb-3 border-2 border-white/40 shadow-inner">
              <img
                src="/src/assets/images/badge_celebration_1790734135931.jpg"
                alt="Piala Juara"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs font-bold tracking-widest uppercase text-amber-200">
              Permainan Resmi Selesai
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
              SELAMAT KEPADA KELOMPOK {winner.name.toUpperCase()}!
            </h1>
            <p className="text-sm text-emerald-100 max-w-lg mt-2">
              Telah meraih poin tertinggi dalam kompetisi pembelajaran <strong>{session.subjectName}</strong> Fase C MIN 1 Paser.
            </p>

            <div className="flex items-center gap-6 mt-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
              <div className="text-center">
                <span className="text-xs text-emerald-200 block">Total Poin</span>
                <span className="text-2xl font-black tabular-nums">{winner.points}</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <span className="text-xs text-amber-200 block">Total Bintang</span>
                <span className="text-2xl font-black text-amber-300 tabular-nums">★ {winner.stars}</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <span className="text-xs text-emerald-200 block">Jawaban Benar</span>
                <span className="text-2xl font-black tabular-nums">{winner.correctAnswers}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenPrintReport}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-colors text-xs sm:text-sm"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                Cetak Rekap Nilai Resmi
              </button>
              <button
                onClick={onEndGame}
                className="px-5 py-2.5 bg-black/30 hover:bg-black/40 text-white font-medium rounded-xl border border-white/20 transition-colors text-xs sm:text-sm"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* FULL LEADERBOARD TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-base text-slate-900 mb-4">
            Hasil Akhir 8 Kelompok Peserta Permainan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3 w-10">Peringkat</th>
                  <th className="py-2.5 px-3">Nama Kelompok</th>
                  <th className="py-2.5 px-3 text-center">Anggota Siswa</th>
                  <th className="py-2.5 px-3 text-center">Poin</th>
                  <th className="py-2.5 px-3 text-center">Bintang</th>
                  <th className="py-2.5 px-3 text-center">Benar</th>
                  <th className="py-2.5 px-3 text-center">Salah</th>
                  <th className="py-2.5 px-3 text-center">Akurasi</th>
                  <th className="py-2.5 px-3 text-center">Status Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedTeams.map((t, idx) => {
                  const total = t.correctAnswers + t.wrongAnswers;
                  const accuracy = total > 0 ? Math.round((t.correctAnswers / total) * 100) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-bold text-slate-700 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></span>
                          <span className="font-bold text-slate-900">Kelompok {t.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        {t.members.map((m) => m.name).join(', ') || '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-800 tabular-nums">
                        {t.points}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600 tabular-nums">
                        ★ {t.stars}
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-700 font-semibold tabular-nums">
                        {t.correctAnswers}
                      </td>
                      <td className="py-3 px-3 text-center text-rose-600 font-semibold tabular-nums">
                        {t.wrongAnswers}
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums font-medium">
                        {accuracy}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        {t.isEliminated ? (
                          <span className="text-rose-700 font-semibold">Tereliminasi</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Lulus Aktif</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ARENA HEADER CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700">{session.subjectName}</span>
              <span aria-hidden="true">·</span>
              <span>{session.grade}</span>
              <span aria-hidden="true">·</span>
              <span>{session.academicYearName}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmEndOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Akhiri Permainan
          </button>
        </div>

      </div>

      {/* 8 TEAMS ROSTER BOARD (Horizontal Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {session.teams.map((team) => {
          const isCurrent = team.id === session.currentTeamId;
          const isElim = team.isEliminated;

          return (
            <div
              key={team.id}
              onClick={() => {
                if (!isElim && !submitting) {
                  handleSelectTeam(team.id);
                }
              }}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                isElim
                  ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed'
                  : isCurrent
                  ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Active Indicator Pin */}
              {isCurrent && !isElim && (
                <div className="absolute top-1 right-1 text-[10px] font-bold text-emerald-700 flex items-center">
                  Giliran
                </div>
              )}

              {/* Team color & name */}
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-bold text-xs text-slate-900 truncate">
                  {team.name}
                </span>
              </div>

              {/* Score & Stars */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold my-1">
                <span className="text-emerald-800 tabular-nums">
                  {team.points} pts
                </span>
                <span className="text-amber-600 tabular-nums">
                  ★ {team.stars}
                </span>
              </div>

              {/* Consecutive Errors / Eliminated Status */}
              <div className="mt-1 pt-1 border-t border-slate-100 text-[11px]">
                {isElim ? (
                  <span className="text-rose-700 font-bold tracking-tight">
                    TERELIMINASI
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <span>Salah:</span>
                    <span className={`font-semibold ${team.consecutiveErrors > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                      {team.consecutiveErrors}/3
                    </span>
                  </div>
                )}
              </div>

              {/* Current Streak badge if > 1 */}
              {!isElim && team.currentStreak > 1 && (
                <div className="mt-1 text-[10px] font-bold text-amber-600">
                  🔥 Streak {team.currentStreak}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ACTIVE QUESTION STAGE */}
      {currentQ ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 space-y-6">
          
          {/* Top question status row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Soal #{currentQIndex + 1} dari {session.questions.length}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500">{currentQ.chapter || 'Bab 1'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">{currentQ.material}</span>
            </div>

            {/* Current answering team tag */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500">Giliran Menjawab:</span>
              <strong className="text-slate-900 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeTeam.color }}
                />
                Kelompok {activeTeam.name}
              </strong>
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed font-sans">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options Grid (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQ.options?.map((opt, idx) => {
              const letter = opt.substring(0, 1).toUpperCase();
              const isSelected = selectedOption === letter;
              const hasFeedback = feedback !== null;
              const isCorrectOpt = hasFeedback && feedback.correctAnswer === letter;
              const isWrongOpt = hasFeedback && isSelected && !feedback.isCorrect;

              return (
                <button
                  key={idx}
                  disabled={submitting || isQuestionAnswered || activeTeam.isEliminated}
                  onClick={() => handleSubmitAnswer(letter)}
                  className={`p-4 rounded-2xl border text-left text-sm sm:text-base font-medium transition-all flex items-start gap-3 relative ${
                    isCorrectOpt
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : isWrongOpt
                      ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold'
                      : isSelected
                      ? 'bg-slate-100 border-slate-400'
                      : 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isCorrectOpt
                        ? 'bg-emerald-600 text-white'
                        : isWrongOpt
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 leading-snug">
                    {opt.substring(2).trim()}
                  </div>

                  {isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isWrongOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* EXPLANATION / FEEDBACK BANNER */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Jawaban Tepat! Kelompok {activeTeam.name} Mendapat +10 Poin.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Jawaban Kurang Tepat. Kunci Jawaban: {feedback.correctAnswer}.</span>
                  </>
                )}
              </div>
              {feedback.explanation && (
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  <strong>Pembahasan:</strong> {feedback.explanation}
                </p>
              )}
            </div>
          )}

          {/* BOTTOM CONTROLS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            {/* Team switcher dropdown for teacher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Pilih Kelompok Lain:</span>
              <div className="flex flex-wrap gap-1">
                {eligibleTeams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTeam(t.id)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      t.id === activeTeam.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Advance to next question */}
            <div className="flex items-center gap-3">
              {currentQIndex + 1 < session.questions.length ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs sm:text-sm"
                >
                  Soal Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmEndOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors text-xs sm:text-sm"
                >
                  <Trophy className="w-4 h-4" />
                  Selesaikan Sesi & Lihat Juara
                </button>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Tidak ada soal yang tersedia.</p>
        </div>
      )}

      {/* CONFIRM END MODAL */}
      {confirmEndOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-200">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Akhiri Permainan Kelas?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Seluruh akumulasi poin dan perolehan bintang akan disimpan secara permanen ke dalam rekapitulasi nilai MIN 1 Paser.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => setConfirmEndOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmEndGame}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Ya, Akhiri Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION MODAL FOR STAR BONUS & ELIMINATION */}
      <CelebrationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        teamName={modalState.teamName}
        teamColor={modalState.teamColor}
        streakCount={modalState.streakCount}
        errorCount={modalState.errorCount}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
