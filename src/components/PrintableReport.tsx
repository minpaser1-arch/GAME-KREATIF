import React from 'react';
import { GameSession, SchoolProfile } from '../types/index.ts';
import { Printer, X } from 'lucide-react';

interface PrintableReportProps {
  session: GameSession;
  school: SchoolProfile;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  session,
  school,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Sort teams for official leaderboard
  const sortedTeams = [...session.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stars !== a.stars) return b.stars - a.stars;
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    return a.wrongAnswers - b.wrongAnswers;
  });

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center">
      {/* Action Bar (Hidden during print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-white p-3 rounded-xl shadow-lg border border-slate-200 print:hidden">
        <div className="text-xs text-slate-600">
          Pratinjau Dokumen Cetak Rekapitulasi Nilai MIN 1 Paser
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="w-full max-w-4xl bg-white p-8 sm:p-12 shadow-2xl rounded-2xl print:shadow-none print:p-0 print:m-0 text-slate-900 font-serif">
        
        {/* KOP SURAT MADRASAH */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 mb-6">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            {school.logoUrl ? (
              <img
                src={school.logoUrl}
                alt="Logo MIN 1 Paser"
                className="w-18 h-18 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded border-2 border-slate-900 flex items-center justify-center font-bold text-lg">
                MIN 1
              </div>
            )}
          </div>

          <div className="text-center flex-1 px-4">
            <h3 className="text-sm font-bold tracking-wider uppercase font-sans text-slate-800">
              Kementerian Agama Republik Indonesia
            </h3>
            <h4 className="text-xs font-semibold tracking-wider uppercase font-sans text-slate-700">
              Kantor Kementerian Agama Kabupaten Paser
            </h4>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 font-sans tracking-tight">
              {school.name}
            </h2>
            <p className="text-[11px] font-sans text-slate-600 mt-0.5">
              {school.address} · Kabupaten Paser, Kalimantan Timur
            </p>
            <p className="text-[10px] font-sans text-slate-500">
              NPSN: {school.npsn} · NSM: {school.nsm}
            </p>
          </div>

          <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center text-center text-[10px] font-sans text-slate-400 border border-dashed border-slate-300 rounded p-1">
            Arsip Asesmen
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center my-6">
          <h1 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
            Berita Acara & Rekapitulasi Hasil Belajar Berbasis Game Edukasi
          </h1>
          <p className="text-xs font-sans text-slate-600 mt-1">
            Program Unggulan: SISWA KREATIF DENGAN GAME KREATIF
          </p>
        </div>

        {/* METADATA TABLE */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-sans mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500">Mata Pelajaran:</span>{' '}
            <strong className="text-slate-900">{session.subjectName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Tahun Pelajaran:</span>{' '}
            <strong className="text-slate-900">{session.academicYearName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Fase / Sasaran:</span>{' '}
            <strong className="text-slate-900">{session.grade} (Fase C Kurikulum Merdeka)</strong>
          </div>
          <div>
            <span className="text-slate-500">Semester:</span>{' '}
            <strong className="text-slate-900">{session.semesterName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Paket Soal:</span>{' '}
            <strong className="text-slate-900">{session.questionSetTitle}</strong>
          </div>
          <div>
            <span className="text-slate-500">Guru Pembina / Pelaksana:</span>{' '}
            <strong className="text-slate-900">{session.teacherName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Waktu Pelaksanaan:</span>{' '}
            <strong className="text-slate-900">
              {new Date(session.startedAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Status Sesi:</span>{' '}
            <strong className="text-emerald-700 uppercase">{session.status}</strong>
          </div>
        </div>

        {/* REKAP KELOMPOK TABLE */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-xs font-sans border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 px-2 py-2 text-center w-10">Peringkat</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Nama Kelompok</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Anggota Siswa</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Total Poin</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Bintang</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Benar</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Salah</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Akurasi</th>
                <th className="border border-slate-300 px-2 py-2 text-center">Status Akhir</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((t, idx) => {
                const total = t.correctAnswers + t.wrongAnswers;
                const accuracy = total > 0 ? Math.round((t.correctAnswers / total) * 100) : 0;
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-semibold">
                      Kelompok {t.name}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-slate-600">
                      {t.members.map((m) => m.name).join(', ') || '-'}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold text-emerald-800 tabular-nums">
                      {t.points}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold text-amber-700 tabular-nums">
                      ★ {t.stars}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-emerald-700 font-semibold tabular-nums">
                      {t.correctAnswers}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-rose-600 font-semibold tabular-nums">
                      {t.wrongAnswers}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center tabular-nums">
                      {accuracy}%
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {t.isEliminated ? (
                        <span className="text-rose-700 font-semibold">Tereliminasi</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Aktif</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CATATAN DAN KESIMPULAN */}
        <div className="text-xs font-sans text-slate-700 mb-8 border-l-2 border-emerald-600 pl-3 py-1">
          <p className="font-semibold text-slate-900">Catatan Evaluasi Pembelajaran Guru:</p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            Pembelajaran berbasis game kreatif telah selesai dilaksanakan dengan melibatkan partisipasi aktif seluruh 8 kelompok siswa Kelas VI MIN 1 Paser. 
            Hasil penilaian ini diakui secara sah sebagai bagian dari asesmen formatif Kurikulum Merdeka.
          </p>
        </div>

        {/* TANDA TANGAN RESMI */}
        <div className="grid grid-cols-2 gap-8 text-xs font-sans pt-6 border-t border-slate-200">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold text-slate-900">Kepala MIN 1 Paser</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 border border-dashed border-slate-200 px-4 py-2 rounded">
                [ Tanda Tangan & Cap Madrasah ]
              </span>
            </div>
            <p className="font-bold underline text-slate-900">{school.headmasterName}</p>
            <p className="text-slate-600">NIP. {school.headmasterNip}</p>
          </div>

          <div className="text-center">
            <p>Tanah Grogot, {currentDateFormatted}</p>
            <p className="font-semibold text-slate-900">Guru Pembina / Pengembang</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 border border-dashed border-slate-200 px-4 py-2 rounded">
                [ Tanda Tangan Guru ]
              </span>
            </div>
            <p className="font-bold underline text-slate-900">{school.developerName}</p>
            <p className="text-slate-600">{school.developerTitle}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
