import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building,
  Calendar,
  Layers,
  BookOpen,
  Database,
  CheckCircle2,
  Plus,
  Shield,
  ExternalLink,
  Code
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { sound } from '../lib/sound.ts';
import { SchoolProfile, AcademicYear, Semester, Subject } from '../types/index.ts';

interface SettingsViewProps {
  school: SchoolProfile | null;
  onUpdateSchool: (updated: SchoolProfile) => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  school,
  onUpdateSchool,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'tahun' | 'mapel' | 'deployment'>('profil');

  // School form
  const [schoolForm, setSchoolForm] = useState<Partial<SchoolProfile>>({});
  const [savingSchool, setSavingSchool] = useState(false);

  // Academic years & Semesters
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [newAyName, setNewAyName] = useState('');
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (school) {
      setSchoolForm(school);
    }
    loadSettingsData();
  }, [school]);

  const loadSettingsData = async () => {
    try {
      const [ayList, semList, subList] = await Promise.all([
        api.getAcademicYears(),
        api.getSemesters(),
        api.getSubjects(),
      ]);
      setAcademicYears(ayList);
      setSemesters(semList);
      setSubjects(subList);
    } catch (err: unknown) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTick();
    setSavingSchool(true);
    try {
      const updated = await api.updateSchoolProfile(schoolForm);
      onUpdateSchool(updated);
      alert('Profil MIN 1 Paser berhasil diperbarui.');
    } catch (err: unknown) {
      console.error('Error updating school:', err);
      alert('Gagal memperbarui profil.');
    } finally {
      setSavingSchool(false);
    }
  };

  const handleCreateAY = async () => {
    if (!newAyName.trim()) return;
    sound.playTick();
    try {
      const created = await api.createAcademicYear(newAyName, false);
      setAcademicYears((prev) => [...prev, created]);
      setNewAyName('');
      alert(`Tahun pelajaran ${created.name} berhasil ditambahkan.`);
      onRefreshData();
    } catch (err: unknown) {
      console.error('Error creating academic year:', err);
      alert('Gagal menambah tahun pelajaran.');
    }
  };

  const handleActivateAY = async (id: string) => {
    sound.playTick();
    try {
      const res = await api.activateAcademicYear(id);
      setAcademicYears(res.academicYears);
      alert('Tahun pelajaran aktif telah dialihkan.');
      onRefreshData();
    } catch (err: unknown) {
      console.error('Error activating AY:', err);
    }
  };

  const handleActivateSemester = async (id: string) => {
    sound.playTick();
    try {
      const res = await api.activateSemester(id);
      setSemesters(res.semesters);
      alert('Semester aktif berhasil diubah.');
      onRefreshData();
    } catch (err: unknown) {
      console.error('Error activating semester:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi Sistem & Administrasi Madrasah</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan Aplikasi & Kurikulum
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data madrasah, periode tahun ajaran, semester, materi 5 mata pelajaran, serta arsitektur deployment.
          </p>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            sound.playTick();
            setActiveSubTab('profil');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'profil'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Identitas Madrasah
        </button>

        <button
          onClick={() => {
            sound.playTick();
            setActiveSubTab('tahun');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'tahun'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Tahun Pelajaran & Semester
        </button>

        <button
          onClick={() => {
            sound.playTick();
            setActiveSubTab('mapel');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'mapel'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          5 Mata Pelajaran & Silabus
        </button>

        <button
          onClick={() => {
            sound.playTick();
            setActiveSubTab('deployment');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSubTab === 'deployment'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Supabase & Panduan Produksi
        </button>
      </div>

      {/* SUB-TAB 1: IDENTITAS RESMI */}
      {activeSubTab === 'profil' && (
        <form onSubmit={handleSaveSchool} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Identitas Resmi Aplikasi & Madrasah
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={schoolForm.appTitle || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, appTitle: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Madrasah
              </label>
              <input
                type="text"
                value={schoolForm.name || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kepala Madrasah
              </label>
              <input
                type="text"
                value={schoolForm.headmasterName || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, headmasterName: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Madrasah
              </label>
              <input
                type="text"
                value={schoolForm.headmasterNip || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, headmasterNip: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pembuat & Pengembang Aplikasi
              </label>
              <input
                type="text"
                value={schoolForm.developerName || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, developerName: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Pengembang
              </label>
              <input
                type="text"
                value={schoolForm.developerTitle || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, developerTitle: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenjang Pendidikan & Sasaran
              </label>
              <input
                type="text"
                value={schoolForm.targetGrade || ''}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, targetGrade: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN & NSM
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="NPSN"
                  value={schoolForm.npsn || ''}
                  onChange={(e) => setSchoolForm((prev) => ({ ...prev, npsn: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
                <input
                  type="text"
                  placeholder="NSM"
                  value={schoolForm.nsm || ''}
                  onChange={(e) => setSchoolForm((prev) => ({ ...prev, nsm: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Madrasah
            </label>
            <input
              type="text"
              value={schoolForm.address || ''}
              onChange={(e) => setSchoolForm((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSchool}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              {savingSchool ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: TAHUN PELAJARAN & SEMESTER */}
      {activeSubTab === 'tahun' && (
        <div className="space-y-6">
          
          {/* Academic Years Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Tahun Pelajaran
            </h3>
            <p className="text-xs text-slate-500">
              Data sesi dan paket soal dari tahun pelajaran sebelumnya tetap tersimpan dan tidak akan terhapus saat berpindah tahun pelajaran aktif.
            </p>

            <div className="space-y-2">
              {academicYears.map((ay) => (
                <div
                  key={ay.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ay.name}</span>
                    {ay.isActive && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        AKTIF SEKARANG
                      </span>
                    )}
                  </div>

                  {!ay.isActive && (
                    <button
                      onClick={() => handleActivateAY(ay.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Academic Year */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newAyName}
                onChange={(e) => setNewAyName(e.target.value)}
                placeholder="Tambah tahun baru (misal: 2027/2028)"
                className="text-xs p-2 rounded-xl border border-slate-300 w-64"
              />
              <button
                onClick={handleCreateAY}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Tambah Tahun Pelajaran
              </button>
            </div>
          </div>

          {/* Semesters Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Semester
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {semesters.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                    s.isActive
                      ? 'bg-emerald-50/70 border-emerald-400 font-semibold'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block text-slate-900">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {s.type === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'}
                    </span>
                  </div>

                  {s.isActive ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivateSemester(s.id)}
                      className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: 5 MATA PELAJARAN & SILABUS */}
      {activeSubTab === 'mapel' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              5 Mata Pelajaran Utama Kelas VI MI
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasi materi pokok, bab, dan Alur Tujuan Pembelajaran (ATP) untuk mendukung generator soal AI.
            </p>

            <div className="space-y-4">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                      <span className="text-xs text-slate-500">({sub.code})</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {sub.fase} · {sub.grade}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{sub.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Silabus & Bab Pembelajaran:
                    </span>
                    {sub.topics.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded bg-white border border-slate-200 text-xs space-y-0.5"
                      >
                        <div className="font-semibold text-slate-800">
                          {t.chapter}: {t.material} {t.submaterial ? `(${t.submaterial})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong>TP:</strong> {t.learningObjective}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SUPABASE & DEPLOYMENT */}
      {activeSubTab === 'deployment' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Database className="w-4 h-4 text-emerald-600" />
              Panduan Integrasi Supabase PostgreSQL & Deployment Produksi Vercel
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Aplikasi telah dilengkapi dengan migrasi SQL lengkap yang mendukung <strong>Row Level Security (RLS)</strong>, relasi tabel lengkap, 
              fungsi transaksi atomik pencegah duplikasi skor, dan indeks performa di berkas:
              <br />
              <code className="text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                supabase/migrations/20260929_siswa_kreatif_schema.sql
              </code>
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono space-y-2">
              <div className="text-emerald-400 font-bold font-sans">
                Langkah Cepat Deployment ke Vercel + Supabase:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Buka console di Supabase (https://supabase.com) dan buat proyek baru.</li>
                <li>Masuk ke menu SQL Editor di Supabase, lalu jalankan script yang ada pada <code className="text-emerald-300">supabase/migrations/20260929_siswa_kreatif_schema.sql</code>.</li>
                <li>Dapatkan Project URL, Anon Key, dan Service Role Key dari menu Project Settings &gt; API.</li>
                <li>Import repositori ini ke Vercel.</li>
                <li>Isi Environment Variables di Vercel:
                  <div className="bg-slate-950 p-2 rounded mt-1 text-[11px] space-y-0.5 text-emerald-200">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...</div>
                    <div>GEMINI_API_KEY=AIzaSy...</div>
                  </div>
                </li>
                <li>Jalankan Deploy! Selesai.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
