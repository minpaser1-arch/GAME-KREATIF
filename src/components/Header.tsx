import React from 'react';
import { Volume2, VolumeX, Play, Shield, User } from 'lucide-react';
import { SchoolProfile, AcademicYear, Semester, UserProfile } from '../types/index.ts';
import { sound } from '../lib/sound.ts';

interface HeaderProps {
  school: SchoolProfile | null;
  activeAcademicYear: AcademicYear | null;
  activeSemester: Semester | null;
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickStartGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  school,
  activeAcademicYear,
  activeSemester,
  currentUser,
  activeTab,
  setActiveTab,
  onQuickStartGame,
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'arena', label: 'Arena Game' },
    { id: 'generator', label: 'Generator AI' },
    { id: 'bank_soal', label: 'Bank Soal' },
    { id: 'archive', label: 'Arsip' },
    { id: 'reports', label: 'Laporan' },
    { id: 'settings', label: 'Pengaturan' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Zone 1 (Brand) - Zone 2 (Nav) - Zone 3 (Actions) */}
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark / brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-emerald-600 flex items-center justify-center text-white font-bold">
                {school?.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt="Logo MIN 1 Paser"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>MI</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  SISWA KREATIF DENGAN GAME KREATIF
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-700">MIN 1 PASER</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeAcademicYear?.name || '2026/2027'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSemester?.type === 'genap' ? 'Genap' : 'Ganjil'}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTick();
                  setActiveTab(item.id);
                }}
                className={`py-1 transition-colors relative ${
                  activeTab === item.id
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={muted ? 'Aktifkan Suara Permainan' : 'Bisukan Suara'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {muted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            </button>

            {/* Quick Play Button */}
            <button
              onClick={onQuickStartGame}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mulai Permainan
            </button>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-medium">
                {currentUser?.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                  {currentUser?.name || 'Dzakirul Husni, S.Pd.'}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">
                  {currentUser?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Nav strip */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto border-t border-slate-100 text-xs font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playTick();
                setActiveTab(item.id);
              }}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
