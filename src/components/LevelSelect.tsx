import React, { useState } from 'react';
import { PRESET_LEVELS } from '../data/animals';
import { soundFx } from '../utils/audio';
import { ArrowLeft, Star, Shuffle, Lock } from 'lucide-react';

interface LevelSelectProps {
  onSelectLevel: (levelNumber: number, isRandomMode?: boolean) => void;
  onBackToMenu: () => void;
  completedLevels: Record<number, number>; // levelNumber -> stars earned (1-3)
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  onSelectLevel,
  onBackToMenu,
  completedLevels,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLevelClick = (level: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundFx.play('wrong');
      setToastMessage(`Level ${level} masih terkunci! Selesaikan Level ${level - 1} terlebih dahulu.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return;
    }
    soundFx.play('click');
    onSelectLevel(level, false);
  };

  const handleRandomMode = () => {
    soundFx.play('click');
    onSelectLevel(1, true); // Random mode flag
  };

  const handleBack = () => {
    soundFx.play('click');
    onBackToMenu();
  };

  return (
    <div className="relative w-full min-h-screen min-h-dvh overflow-y-auto flex flex-col items-center justify-between p-2.5 xs:p-4 sm:p-6 select-none">
      {/* Background Graphic */}
      <img
        src="/assets/BG.png"
        alt="Funiko Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none filter brightness-95"
      />

      {/* Top Header with Back Button */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-2">
        <button
          id="levelselect-back-btn"
          onClick={handleBack}
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center gap-1.5 shadow-lg transition-transform active:scale-90 font-bold text-xs sm:text-base min-h-[40px] touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Kembali</span>
        </button>

        {/* Mode Acak Button */}
        <button
          id="levelselect-random-btn"
          onClick={handleRandomMode}
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-2 border-amber-300 text-white flex items-center gap-1.5 shadow-lg transition-transform active:scale-90 font-bold text-xs sm:text-base min-h-[40px] touch-manipulation"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Mode Acak</span>
        </button>
      </div>

      {/* Title Graphic "Memilih Level" */}
      <div className="relative z-10 w-full max-w-[220px] xs:max-w-[280px] sm:max-w-[420px] my-2 sm:my-3">
        <img
          src="/assets/MemilihLevel.png"
          alt="Memilih Level"
          className="w-full object-contain filter drop-shadow-xl"
        />
      </div>

      {/* Level Buttons Container */}
      <div className="relative z-10 w-full max-w-2xl grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 my-auto px-2 sm:px-4">
        {PRESET_LEVELS.map((lvl) => {
          const isUnlocked = lvl.level === 1 || Boolean(completedLevels[lvl.level - 1]);
          const stars = completedLevels[lvl.level] || 0;

          return (
            <div
              key={lvl.level}
              className="flex flex-col items-center gap-0.5 sm:gap-1"
            >
              <button
                id={`level-button-${lvl.level}`}
                onClick={() => handleLevelClick(lvl.level, isUnlocked)}
                className={`relative w-full h-[52px] sm:h-[68px] flex items-center justify-center transition-all duration-200 group touch-manipulation ${
                  isUnlocked
                    ? 'hover:scale-105 hover:-translate-y-1 hover:rotate-1 active:scale-95'
                    : 'opacity-70 filter brightness-75 active:scale-95'
                }`}
              >
                <img
                  src="/assets/Tombol_Mulai.png"
                  alt={`Level ${lvl.level}`}
                  className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-md ${
                    !isUnlocked ? 'grayscale brightness-50' : ''
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/Btn_.png';
                  }}
                />
                <span
                  className={`relative z-10 text-lg sm:text-2xl font-extrabold tracking-widest flex items-center gap-1 ${
                    isUnlocked ? 'text-white' : 'text-stone-300'
                  }`}
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                    WebkitTextStroke: isUnlocked ? '0.5px #451a03' : '0.5px #1c1917',
                    letterSpacing: '0.12em',
                  }}
                >
                  {!isUnlocked && <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />}
                  Level {lvl.level}
                </span>
              </button>

              {/* Sub-label info & Stars or Locked Status */}
              {isUnlocked ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        starIdx <= stars
                          ? 'fill-yellow-400 text-yellow-500 filter drop-shadow'
                          : 'text-stone-700/60 fill-stone-800/40'
                      }`}
                    />
                  ))}
                  <span className="text-amber-200/90 text-[10px] sm:text-xs font-bold ml-0.5" style={{ letterSpacing: '0.06em' }}>
                    ({lvl.animalCount} Hewan)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-300/90 text-[10px] sm:text-xs font-extrabold" style={{ letterSpacing: '0.06em' }}>
                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                  <span>Terkunci</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toast Popup Notification for Locked Level */}
      {toastMessage && (
        <div className="fixed bottom-12 z-50 animate-modal-pop px-4 py-2.5 rounded-2xl bg-amber-950/95 border-2 border-red-500 text-amber-200 text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 max-w-sm text-center">
          <Lock className="w-4 h-4 text-red-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer Info */}
      <div className="relative z-10 text-amber-200/90 font-bold text-xs sm:text-sm tracking-widest text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
        Selesaikan level sebelumnya untuk membuka level berikutnya!
      </div>
    </div>
  );
};
