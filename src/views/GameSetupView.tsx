import React, { useEffect, useState } from 'react';
import { Play, BookOpen, Users, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { QuestionSet, GameTeam, GameSession } from '../types/index.ts';

interface GameSetupViewProps {
  initialSetId?: string;
  onCancel: () => void;
  onGameCreated: (session: GameSession) => void;
}

export const GameSetupView: React.FC<GameSetupViewProps> = ({
  initialSetId,
  onCancel,
  onGameCreated,
}) => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>(initialSetId || '');
  const [gameTitle, setGameTitle] = useState('');
  const [turnMode, setTurnMode] = useState<'round_robin' | 'teacher_select'>('round_robin');

  // 8 teams customizable
  const [teams, setTeams] = useState<GameTeam[]>([
    {
      id: 'team-garuda',
      name: 'Garuda',
      color: '#EF4444',
      members: [{ id: 'm-1', name: 'Ahmad Fauzan' }, { id: 'm-2', name: 'Siti Nurhaliza' }, { id: 'm-3', name: 'Rizky Pratama' }, { id: 'm-4', name: 'Aisyah Putri' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-elang',
      name: 'Elang',
      color: '#0284C7',
      members: [{ id: 'm-5', name: 'Budi Santoso' }, { id: 'm-6', name: 'Dewi Lestari' }, { id: 'm-7', name: 'Muhammad Alif' }, { id: 'm-8', name: 'Zahra Amelia' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-rajawali',
      name: 'Rajawali',
      color: '#10B981',
      members: [{ id: 'm-9', name: 'Fikri Haikal' }, { id: 'm-10', name: 'Nabila Syakieb' }, { id: 'm-11', name: 'Dimas Setiawan' }, { id: 'm-12', name: 'Salma Khairunnisa' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-cendekia',
      name: 'Cendekia',
      color: '#F59E0B',
      members: [{ id: 'm-13', name: 'Rian Hidayat' }, { id: 'm-14', name: 'Meisya Salsabila' }, { id: 'm-15', name: 'Farhan Maulana' }, { id: 'm-16', name: 'Tiara Ananda' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-kreator',
      name: 'Kreator',
      color: '#8B5CF6',
      members: [{ id: 'm-17', name: 'Gilang Ramadhan' }, { id: 'm-18', name: 'Annisa Rahma' }, { id: 'm-19', name: 'Irfan Hakim' }, { id: 'm-20', name: 'Khadijah Marwah' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-inovator',
      name: 'Inovator',
      color: '#0D9488',
      members: [{ id: 'm-21', name: 'Hafiz Ar-Rasyid' }, { id: 'm-22', name: 'Syifa Nuraini' }, { id: 'm-23', name: 'Wahyu Nugroho' }, { id: 'm-24', name: 'Laila Majnun' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-juara',
      name: 'Juara',
      color: '#4F46E5',
      members: [{ id: 'm-25', name: 'Ilham Akbar' }, { id: 'm-26', name: 'Putri Ayu' }, { id: 'm-27', name: 'Farel Prayoga' }, { id: 'm-28', name: 'Maya Anggraini' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
    {
      id: 'team-bintang',
      name: 'Bintang',
      color: '#F97316',
      members: [{ id: 'm-29', name: 'Danu Wirawan' }, { id: 'm-30', name: 'Zaskia Adya' }, { id: 'm-31', name: 'Arif Rahman' }, { id: 'm-32', name: 'Fatimah Az-Zahra' }],
      points: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0, totalAnswered: 0, consecutiveErrors: 0, currentStreak: 0, isEliminated: false
    },
  ]);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      setLoading(true);
      const sets = await api.getQuestionSets();
      setQuestionSets(sets);
      if (sets.length > 0 && !selectedSetId) {
        setSelectedSetId(sets[0].id);
        setGameTitle(`Permainan Kelas: ${sets[0].title}`);
      } else if (initialSetId) {
        const found = sets.find((s) => s.id === initialSetId);
        if (found) {
          setGameTitle(`Permainan Kelas: ${found.title}`);
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching question sets:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat paket soal');
    } finally {
      setLoading(false);
    }
  };

  const handleSetChange = (setId: string) => {
    setSelectedSetId(setId);
    const chosen = questionSets.find((s) => s.id === setId);
    if (chosen) {
      setGameTitle(`Permainan Kelas: ${chosen.title}`);
    }
  };

  const handleUpdateTeamName = (teamIndex: number, newName: string) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[teamIndex] = { ...copy[teamIndex], name: newName };
      return copy;
    });
  };

  const handleUpdateMember = (teamIndex: number, memberIndex: number, name: string) => {
    setTeams((prev) => {
      const copy = [...prev];
      const membersCopy = [...copy[teamIndex].members];
      membersCopy[memberIndex] = { ...membersCopy[memberIndex], name };
      copy[teamIndex] = { ...copy[teamIndex], members: membersCopy };
      return copy;
    });
  };

  const handleStartGame = async () => {
    if (!selectedSetId) {
      alert('Silakan pilih salah satu paket soal terlebih dahulu.');
      return;
    }

    sound.playTick();
    setCreating(true);
    setError(null);

    try {
      const session = await api.createGameSession({
        title: gameTitle || 'Sesi Permainan Siswa Kreatif',
        questionSetId: selectedSetId,
        turnMode,
        teamsData: teams,
      });

      onGameCreated(session);
    } catch (err: unknown) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Gagal memulai permainan');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-slate-500">Menyiapkan konfigurasi permainan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </button>
        <span className="text-xs text-slate-500 font-medium">
          Pengaturan Sesi Permainan Kelas VI · MIN 1 Paser
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: PAKET SOAL & JUDUL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
            1
          </span>
          Pilih Paket Soal & Judul Sesi Permainan
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Paket Soal Pembelajaran (Kurikulum Merdeka MI)
          </label>
          <select
            value={selectedSetId}
            onChange={(e) => handleSetChange(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {questionSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.subjectName} · {s.totalQuestions} Soal)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Judul Sesi Permainan
          </label>
          <input
            type="text"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="Contoh: Asesmen Formatif IPAS Bab 1 - Rangka dan Sendi"
            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Aturan Giliran Kelompok
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTurnMode('round_robin')}
              className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                turnMode === 'round_robin'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                turnMode === 'round_robin' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
              }`}>
                {turnMode === 'round_robin' && <Check className="w-2.5 h-2.5" />}
              </div>
              <div>
                <span className="font-bold block">Giliran Otomatis (Bergantian)</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Sistem otomatis mengalihkan giliran ke kelompok aktif berikutnya secara adil.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTurnMode('teacher_select')}
              className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                turnMode === 'teacher_select'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                turnMode === 'teacher_select' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
              }`}>
                {turnMode === 'teacher_select' && <Check className="w-2.5 h-2.5" />}
              </div>
              <div>
                <span className="font-bold block">Guru Menentukan Kelompok</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Guru bebas memilih kelompok mana yang berhak menjawab setiap butir pertanyaan.
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2: 8 KELOMPOK SISWA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
              2
            </span>
            Daftar 8 Kelompok Siswa & Nama Anggota (Maks. 4 Siswa per Kelompok)
          </div>
          <span className="text-xs text-slate-500">
            Dapat disesuaikan dengan presensi kelas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((team, tIdx) => (
            <div
              key={team.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleUpdateTeamName(tIdx, e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2 py-1"
                />
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Anggota Siswa
                </span>
                {team.members.map((member, mIdx) => (
                  <input
                    key={member.id}
                    type="text"
                    value={member.name}
                    placeholder={`Siswa ${mIdx + 1}`}
                    onChange={(e) => handleUpdateMember(tIdx, mIdx, e.target.value)}
                    className="w-full text-[11px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Batalkan
        </button>

        <button
          disabled={creating}
          onClick={handleStartGame}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-current" />
          {creating ? 'Membuka Arena...' : 'Mulai Arena Permainan Sekarang!'}
        </button>
      </div>

    </div>
  );
};
