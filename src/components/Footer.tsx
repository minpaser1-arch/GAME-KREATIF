import React from 'react';
import { SchoolProfile } from '../types/index.ts';

interface FooterProps {
  school: SchoolProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ school }) => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-semibold text-slate-800 text-sm">
              {school?.appTitle || 'SISWA KREATIF DENGAN GAME KREATIF'}
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-medium text-emerald-700">{school?.name || 'MIN 1 PASER'}</span>
              <span aria-hidden="true">·</span>
              <span>{school?.district || 'Tanah Grogot'}, {school?.province || 'Kalimantan Timur'}</span>
              <span aria-hidden="true">·</span>
              <span>NPSN: {school?.npsn || '60728192'}</span>
              <span aria-hidden="true">·</span>
              <span>NSM: {school?.nsm || '111164020001'}</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              <span>Kepala Madrasah: <strong className="text-slate-700">{school?.headmasterName || 'Ismail, S.Ag'}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Pengembang: <strong className="text-slate-700">{school?.developerName || 'Dzakirul Husni, S.Pd.'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Fase C (Kelas VI) Kurikulum Merdeka</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Pelajaran 2026/2027</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
