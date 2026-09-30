import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  Plus,
  AlertCircle,
  HelpCircle,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { Subject, Question, DifficultyLevel, QuestionType } from '../types/index.ts';

interface AiGeneratorViewProps {
  onSavedToBank: () => void;
  onCreatePackFromQuestions: (questionIds: string[]) => void;
}

export const AiGeneratorView: React.FC<AiGeneratorViewProps> = ({
  onSavedToBank,
  onCreatePackFromQuestions,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-ipas');

  // Input states
  const [fase, setFase] = useState('Fase C');
  const [grade, setGrade] = useState('Kelas VI');
  const [academicYearName, setAcademicYearName] = useState('2026/2027');
  const [semesterName, setSemesterName] = useState('Semester Ganjil 2026/2027');
  const [chapter, setChapter] = useState('Bab 1');
  const [material, setMaterial] = useState('Bagaimana Tubuh Kita Bergerak');
  const [submaterial, setSubmaterial] = useState('Sistem Rangka, Sendi, dan Otot Manusia');
  const [learningObjective, setLearningObjective] = useState(
    'Siswa dapat menjelaskan fungsi rangka, sendi, dan otot dalam sistem gerak manusia serta cara merawat kesehatannya.'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('sedang');
  const [type, setType] = useState<QuestionType>('pilihan_ganda');
  const [count, setCount] = useState<number>(5);
  const [extraInstructions, setExtraInstructions] = useState('');

  // Generation result states
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
        applySubjectDefaults(data[0]);
      }
    } catch (err: unknown) {
      console.error('Error fetching subjects:', err);
    }
  };

  const applySubjectDefaults = (sub: Subject) => {
    if (sub.topics && sub.topics.length > 0) {
      const t = sub.topics[0];
      setChapter(t.chapter);
      setMaterial(t.material);
      setSubmaterial(t.submaterial || '');
      setLearningObjective(t.learningObjective);
    }
  };

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const found = subjects.find((s) => s.id === subId);
    if (found) {
      applySubjectDefaults(found);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    const curSub = subjects.find((s) => s.id === selectedSubjectId);
    if (!curSub) return;
    const t = curSub.topics.find((item) => item.id === topicId);
    if (t) {
      setChapter(t.chapter);
      setMaterial(t.material);
      setSubmaterial(t.submaterial || '');
      setLearningObjective(t.learningObjective);
    }
  };

  const handleGenerate = async () => {
    if (count < 1 || count > 100) {
      alert('Jumlah soal harus antara 1 sampai 100.');
      return;
    }
    if (!material.trim()) {
      alert('Materi pokok pembelajaran wajib diisi.');
      return;
    }

    sound.playTick();
    setGenerating(true);
    setFeedbackMsg(null);

    const curSub = subjects.find((s) => s.id === selectedSubjectId);

    try {
      const res = await api.generateQuestionsWithAI({
        subjectName: curSub?.name || 'IPAS',
        subjectId: selectedSubjectId,
        fase,
        grade,
        academicYearName,
        semesterName,
        chapter,
        material,
        submaterial,
        learningObjective,
        difficulty,
        type,
        count,
        extraInstructions,
      });

      setGeneratedQuestions(res.questions);
      setFeedbackMsg({
        type: 'success',
        text: `Berhasil menghasilkan ${res.questions.length} butir soal via ${res.provider}. Status awal: Perlu Ditinjau.`,
      });
      sound.playCorrect();
    } catch (err: unknown) {
      console.error('Generation failed:', err);
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal menghasilkan soal dengan AI.',
      });
      sound.playWrong();
    } finally {
      setGenerating(false);
    }
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({
      questionText: q.questionText,
      options: [...(q.options || [])],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
  };

  const handleSaveEdit = (qId: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((item) => {
        if (item.id === qId) {
          return {
            ...item,
            ...editForm,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteItem = (qId: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleApprove = (qId: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, status: 'disetujui' } : q))
    );
    sound.playTick();
  };

  const handleApproveAll = () => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => ({ ...q, status: 'disetujui' }))
    );
    sound.playTick();
  };

  // Save approved questions into Bank Soal database
  const handleSaveToBankSoal = async () => {
    if (generatedQuestions.length === 0) return;

    sound.playTick();
    setSaving(true);
    try {
      for (const q of generatedQuestions) {
        await api.createQuestion(q);
      }
      alert(`Berhasil menyimpan ${generatedQuestions.length} butir soal ke Bank Soal MIN 1 Paser!`);
      onSavedToBank();
    } catch (err: unknown) {
      console.error('Error saving questions to bank:', err);
      alert('Gagal menyimpan beberapa soal ke Bank Soal.');
    } finally {
      setSaving(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Curriculum Engine · Powered by Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Generator Soal Otomatis Berbasis AI
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Hasilkan paket soal asesmen formatif Kurikulum Merdeka Fase C (Kelas VI) MI dengan cepat, terstruktur, dan tervalidasi. 
            Semua butir soal wajib ditinjau oleh guru sebelum digunakan dalam sesi game.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <span>MIN 1 Paser</span>
          <span aria-hidden="true">·</span>
          <span>Batas 1–100 Soal/Permintaan</span>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* GENERATOR CONFIGURATION FORM */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mata Pelajaran (Fase C)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Curriculum Topic Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih dari Silabus Kurikulum MI
            </label>
            <select
              onChange={(e) => handleTopicSelect(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">-- Muat Topik Tersimpan --</option>
              {currentSubject?.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.chapter}: {t.material}
                </option>
              ))}
            </select>
          </div>

          {/* Target Grade & Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kelas & Tahun Pelajaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                placeholder="Kelas VI"
              />
              <input
                type="text"
                value={academicYearName}
                onChange={(e) => setAcademicYearName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                placeholder="2026/2027"
              />
            </div>
          </div>

        </div>

        {/* Bab, Material, Submaterial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bab / Unit
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Bab 1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Materi Pokok <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
              placeholder="Contoh: Rangka, Sendi, dan Otot"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Submateri (Spesifik)
            </label>
            <input
              type="text"
              value={submaterial}
              onChange={(e) => setSubmaterial(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Sendi Peluru dan Sendi Engsel"
            />
          </div>
        </div>

        {/* Learning Objectives */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tujuan Pembelajaran (Alur Tujuan Pembelajaran / ATP)
          </label>
          <textarea
            rows={2}
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            placeholder="Tujuan pembelajaran yang ingin diukur dalam game..."
          />
        </div>

        {/* Question Type, Difficulty, Count, Extra Prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bentuk Soal
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="pilihan_ganda">Pilihan Ganda (4 Opsi: A, B, C, D)</option>
              <option value="benar_salah">Benar atau Salah</option>
              <option value="isian_singkat">Isian Singkat</option>
              <option value="uraian">Uraian / Esai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tingkat Kesulitan
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
              <option value="hots">HOTS (Higher Order Thinking)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jumlah Soal (1 – 100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Instruksi Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              placeholder="Contoh: Sertakan konteks kearifan lokal Paser"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            disabled={generating}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            {generating ? 'Sedang Memproses AI...' : `Generate ${count} Soal dengan AI`}
          </button>
        </div>

      </div>

      {/* GENERATED QUESTIONS REVIEW DECK */}
      {generatedQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Hasil Generator AI ({generatedQuestions.length} Butir Soal)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa setiap butir soal, kunci jawaban, dan pembahasan. Soal yang telah disetujui dapat disimpan ke bank soal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApproveAll}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-300 rounded-lg transition-colors"
              >
                Setujui Semua
              </button>
              <button
                disabled={saving}
                onClick={handleSaveToBankSoal}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Menyimpan...' : 'Simpan ke Bank Soal'}
              </button>
            </div>
          </div>

          {/* List of generated questions */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => {
              const isEditing = editingId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    q.status === 'disetujui'
                      ? 'bg-emerald-50/30 border-emerald-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          Edit Soal #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(q.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                          >
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs"
                          >
                            Batal
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Teks Soal
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.questionText || ''}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, questionText: e.target.value }))}
                          className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>

                      {q.type === 'pilihan_ganda' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {editForm.options?.map((opt, oIdx) => (
                            <input
                              key={oIdx}
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(editForm.options || [])];
                                newOpts[oIdx] = e.target.value;
                                setEditForm((prev) => ({ ...prev, options: newOpts }));
                              }}
                              className="text-xs p-2 rounded border border-slate-300 bg-white"
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Kunci Jawaban
                          </label>
                          <input
                            type="text"
                            value={editForm.correctAnswer || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                            className="text-xs p-2 rounded border border-slate-300 bg-white font-bold w-full uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Tingkat Kesulitan
                          </label>
                          <select
                            value={editForm.difficulty}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                            className="text-xs p-2 rounded border border-slate-300 bg-white w-full"
                          >
                            <option value="mudah">Mudah</option>
                            <option value="sedang">Sedang</option>
                            <option value="sulit">Sulit</option>
                            <option value="hots">HOTS</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Pembahasan Jawaban
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.explanation || ''}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, explanation: e.target.value }))}
                          className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            #{idx + 1}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {q.difficulty.toUpperCase()} · {q.type.replace('_', ' ')}
                          </span>
                          {q.status === 'disetujui' ? (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Disetujui
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-semibold">
                              ● Perlu Ditinjau Guru
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {q.status !== 'disetujui' && (
                            <button
                              onClick={() => handleApprove(q.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            >
                              Setujui
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Edit Soal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(q.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="font-semibold text-xs sm:text-sm text-slate-900 leading-relaxed mb-3">
                        {q.questionText}
                      </p>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                          {q.options.map((opt, oIdx) => {
                            const letter = opt.substring(0, 1).toUpperCase();
                            const isCorrect = letter === q.correctAnswer.toUpperCase();
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border ${
                                  isCorrect
                                    ? 'bg-emerald-100/50 border-emerald-400 font-semibold text-emerald-900'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-bold text-emerald-800 mr-2">
                          Kunci: {q.correctAnswer}
                        </span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
