import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, AlertTriangle, ArrowRight } from 'lucide-react';
import { sound } from '../lib/sound.ts';

interface CelebrationModalProps {
  isOpen: boolean;
  type: 'star_bonus' | 'elimination';
  teamName: string;
  teamColor?: string;
  streakCount?: number;
  errorCount?: number;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  type,
  teamName,
  teamColor = '#F59E0B',
  streakCount = 5,
  errorCount = 3,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (type === 'star_bonus') {
      sound.playStarBonus();

      // Launch cheerful confetti bursts
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else if (type === 'elimination') {
      sound.playElimination();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100 transform transition-all scale-100">
        
        {type === 'star_bonus' ? (
          <div>
            {/* Stars visual cluster */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce"
                  style={{ animationDelay: `${s * 0.1}s` }}
                />
              ))}
            </div>

            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Pencapaian Istimewa
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 mb-2 leading-tight">
              HORE, KALIAN DAPAT BINTANG BERJUMLAH 5 BINTANG!
            </h2>

            <div className="p-3 my-4 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 text-sm">
              <p>
                Selamat kepada <strong style={{ color: teamColor }}>Kelompok {teamName}</strong>!
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Berhasil menjawab secara beruntun <strong>{streakCount} soal benar</strong>. Terus pertahankan kekompakan!
              </p>
            </div>

            <button
              onClick={() => {
                sound.playTick();
                onClose();
              }}
              className="w-full mt-2 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Lanjutkan Permainan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {/* Elimination Icon */}
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 border border-rose-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold text-rose-600 tracking-wider uppercase">
              Pemberitahuan Sistem
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 mb-2 leading-tight">
              KELOMPOK TERELIMINASI!
            </h2>

            <div className="p-3.5 my-4 rounded-xl bg-rose-50 border border-rose-200 text-slate-800 text-sm text-left">
              <p className="font-semibold text-rose-900">
                Kelompok {teamName}
              </p>
              <p className="text-xs text-rose-700 mt-1">
                Telah mencapai <strong>{errorCount} kali kesalahan berturut-turut</strong> dalam menjawab soal.
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-rose-200/60 text-xs text-slate-600 leading-relaxed">
                Sesuai aturan kompetisi MIN 1 Paser, kelompok ini tidak dapat lagi memilih atau menjawab pada sisa sesi permainan aktif ini.
                Poin dan bintang yang telah diperoleh tetap tersimpan dalam rekapitulasi.
              </div>
            </div>

            <button
              onClick={() => {
                sound.playTick();
                onClose();
              }}
              className="w-full mt-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Mengerti, Lanjutkan Permainan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
