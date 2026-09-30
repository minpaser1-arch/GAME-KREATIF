import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Play,
  Download,
  Upload,
  Layers,
  Package,
  Archive,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { Question, QuestionSet, Subject, DifficultyLevel, QuestionType } from '../types/index.ts';

interface QuestionBankViewProps {
  onStartGameWithSet: (setId: string) => void;
  onNavigateToGenerator: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onStartGameWithSet,
  onNavigateToGenerator,
}) => {
  const [activeTab, setActiveTab] = useState<'soal' | 'paket'>('soal');
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected for pack creation
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [newPackTitle, setNewPackTitle] = useState('');
  const [newPackDesc, setNewPackDesc] = useState('');

  // Manual Question Creator Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState<{
    subjectId: string;
    chapter: string;
    material: string;
    learningObjective: string;
    difficulty: DifficultyLevel;
    type: QuestionType;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>({
    subjectId: 'sub-ipas',
    chapter: 'Bab 1',
    material: 'Bagaimana Tubuh Kita Bergerak',
    learningObjective: '',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: '',
    options: ['A. ', 'B. ', 'C. ', 'D. '],
    correctAnswer: 'A',
    explanation: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [qs, sets, subs] = await Promise.all([
        api.getQuestions(),
        api.getQuestionSets(),
        api.getSubjects(),
      ]);
      setQuestions(qs);
      setQuestionSets(sets);
      setSubjects(subs);
      if (subs.length > 0) {
        setManualForm((prev) => ({ ...prev, subjectId: subs[0].id }));
      }
    } catch (err: unknown) {
      console.error('Error loading bank soal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const qs = await api.getQuestions({
        subjectId: selectedSubject || undefined,
        difficulty: selectedDifficulty || undefined,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      });
      setQuestions(qs);
    } catch (err: unknown) {
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectQuestion = (id: string) => {
    sound.playTick();
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    sound.playTick();
    if (selectedQuestionIds.size === questions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleCreatePack = async () => {
    if (!newPackTitle.trim()) {
      alert('Judul paket soal wajib diisi.');
      return;
    }
    if (selectedQuestionIds.size === 0) {
      alert('Pilih minimal satu butir soal.');
      return;
    }

    sound.playTick();
    const firstQId = Array.from(selectedQuestionIds)[0];
    const firstQ = questions.find((q) => q.id === firstQId);

    try {
      const newSet = await api.createQuestionSet({
        title: newPackTitle,
        subjectId: firstQ?.subjectId || subjects[0]?.id || 'sub-ipas',
        questionIds: Array.from(selectedQuestionIds),
        description: newPackDesc,
      });

      setQuestionSets((prev) => [newSet, ...prev]);
      setPackModalOpen(false);
      setNewPackTitle('');
      setNewPackDesc('');
      setSelectedQuestionIds(new Set());
      setActiveTab('paket');
      alert('Paket soal berhasil dibuat dan siap dimainkan!');
    } catch (err: unknown) {
      console.error('Error creating set:', err);
      alert('Gagal membuat paket soal.');
    }
  };

  const handleCreateManualQuestion = async () => {
    if (!manualForm.questionText.trim()) {
      alert('Teks soal wajib diisi.');
      return;
    }

    sound.playTick();
    try {
      const curSub = subjects.find((s) => s.id === manualForm.subjectId);
      const newQ = await api.createQuestion({
        ...manualForm,
        subjectName: curSub?.name || 'Mata Pelajaran',
        source: 'manual',
        status: 'disetujui',
      });

      setQuestions((prev) => [newQ, ...prev]);
      setManualModalOpen(false);
      setManualForm({
        subjectId: subjects[0]?.id || 'sub-ipas',
        chapter: 'Bab 1',
        material: 'Bagaimana Tubuh Kita Bergerak',
        learningObjective: '',
        difficulty: 'sedang',
        type: 'pilihan_ganda',
        questionText: '',
        options: ['A. ', 'B. ', 'C. ', 'D. '],
        correctAnswer: 'A',
        explanation: '',
      });
      alert('Soal berhasil ditambahkan ke Bank Soal.');
    } catch (err: unknown) {
      console.error('Error creating question:', err);
      alert('Gagal membuat soal manual.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) return;
    sound.playTick();

    try {
      const res = await api.deleteQuestion(id);
      if (res.archived) {
        alert(res.message);
        loadAll();
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err: unknown) {
      console.error('Error deleting question:', err);
      alert('Gagal menghapus soal.');
    }
  };

  const handleExportJson = () => {
    sound.playTick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'bank_soal_min1paser.json');
    dlAnchor.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER & TOP TABS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Penyimpanan Kurikulum MI Terintegrasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bank Soal & Paket Pembelajaran
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola ribuan butir soal, buat paket game kelas, dan ekspor data asesmen MIN 1 Paser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Soal Manual
          </button>

          <button
            onClick={onNavigateToGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
          >
            Generator AI
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors"
            title="Ekspor JSON"
          >
            <Download className="w-4 h-4" />
            Ekspor JSON
          </button>
        </div>
      </div>

      {/* SEGMENTED TAB SELECTOR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            sound.playTick();
            setActiveTab('soal');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'soal'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Butir Soal ({questions.length})
        </button>

        <button
          onClick={() => {
            sound.playTick();
            setActiveTab('paket');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'paket'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Paket Soal Siap Main ({questionSets.length})
        </button>
      </div>

      {activeTab === 'soal' ? (
        /* TAB 1: BUTIR SOAL */
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari teks soal atau materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Mata Pelajaran</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Kesulitan</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
              <option value="hots">HOTS</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Status</option>
              <option value="disetujui">Disetujui</option>
              <option value="perlu_ditinjau">Perlu Ditinjau</option>
              <option value="diarsipkan">Diarsipkan</option>
            </select>

            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
            >
              Terapkan Filter
            </button>
          </div>

          {/* BATCH ACTION BAR (IF SELECTED > 0) */}
          {selectedQuestionIds.size > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <span className="font-semibold text-emerald-900">
                {selectedQuestionIds.size} butir soal dipilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPackModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  Jadikan Paket Soal Baru
                </button>
                <button
                  onClick={() => setSelectedQuestionIds(new Set())}
                  className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Batalkan Pilihan
                </button>
              </div>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <button
                onClick={handleSelectAllVisible}
                className="font-semibold text-slate-700 hover:underline"
              >
                {selectedQuestionIds.size === questions.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
              <span>Menampilkan {questions.length} butir soal</span>
            </div>

            {questions.map((q) => {
              const isSelected = selectedQuestionIds.has(q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border bg-white transition-all flex items-start gap-3 ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectQuestion(q.id)}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {q.subjectName}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500">{q.chapter || 'Bab 1'}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-700 uppercase text-[10px]">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          q.status === 'disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'diarsipkan'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status === 'disetujui' ? 'Disetujui' : q.status === 'diarsipkan' ? 'Diarsipkan' : 'Perlu Ditinjau'}
                        </span>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt, idx) => {
                          const letter = opt.substring(0, 1).toUpperCase();
                          const isCorrect = letter === q.correctAnswer.toUpperCase();
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                  : 'bg-slate-50/50 border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <strong className="text-emerald-800 mr-2">Kunci: {q.correctAnswer}</strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* TAB 2: PAKET SOAL (QUESTION SETS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionSets.map((set) => (
            <div
              key={set.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-emerald-700">{set.subjectName}</span>
                  <span>{set.academicYearName}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                  {set.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {set.description || 'Paket soal asesmen formatif MIN 1 Paser.'}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-bold tabular-nums text-slate-900">{set.totalQuestions} Soal</span>
                  <span aria-hidden="true">·</span>
                  <span>{set.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>{set.semesterName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dibuat oleh {set.createdByName || 'Guru'}
                </span>
                <button
                  onClick={() => onStartGameWithSet(set.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mulai Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PACK MODAL */}
      {packModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Buat Paket Soal Baru
            </h3>
            <p className="text-xs text-slate-500">
              Paket ini akan memuat <strong>{selectedQuestionIds.size} butir soal</strong> yang telah Anda pilih.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Paket Soal
              </label>
              <input
                type="text"
                value={newPackTitle}
                onChange={(e) => setNewPackTitle(e.target.value)}
                placeholder="Contoh: Paket Asesmen Formatif IPAS VI - Gerak dan Bumi"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                rows={2}
                value={newPackDesc}
                onChange={(e) => setNewPackDesc(e.target.value)}
                placeholder="Keterangan materi dan tujuan pembelajaran..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPackModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePack}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Simpan Paket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL QUESTION MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <h3 className="text-base font-bold text-slate-900">
              Tambah Butir Soal Baru Secara Manual
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={manualForm.subjectId}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  value={manualForm.difficulty}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                  <option value="hots">HOTS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Materi Pokok
              </label>
              <input
                type="text"
                value={manualForm.material}
                onChange={(e) => setManualForm((prev) => ({ ...prev, material: e.target.value }))}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teks Soal
              </label>
              <textarea
                rows={3}
                value={manualForm.questionText}
                onChange={(e) => setManualForm((prev) => ({ ...prev, questionText: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                placeholder="Tuliskan pertanyaan..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Pilihan Jawaban (A, B, C, D)
              </label>
              {manualForm.options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const copy = [...manualForm.options];
                    copy[idx] = e.target.value;
                    setManualForm((prev) => ({ ...prev, options: copy }));
                  }}
                  className="w-full text-xs p-2 rounded border border-slate-300"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kunci Jawaban (A / B / C / D)
                </label>
                <input
                  type="text"
                  value={manualForm.correctAnswer}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, correctAnswer: e.target.value.toUpperCase() }))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Soal
                </label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, type: e.target.value as QuestionType }))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="pilihan_ganda">Pilihan Ganda</option>
                  <option value="benar_salah">Benar / Salah</option>
                  <option value="isian_singkat">Isian Singkat</option>
                  <option value="uraian">Uraian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pembahasan Jawaban
              </label>
              <textarea
                rows={2}
                value={manualForm.explanation}
                onChange={(e) => setManualForm((prev) => ({ ...prev, explanation: e.target.value }))}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
                placeholder="Penjelasan edukatif untuk siswa..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setManualModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleCreateManualQuestion}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Simpan Butir Soal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
