import React from 'react';
import { soundFx } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onSelectLevel: () => void;
  onGoToLobby: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onSelectLevel,
  onGoToLobby,
}) => {
  const handleClick = (callback: () => void) => {
    soundFx.play('click');
    callback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xs sm:max-w-md bg-amber-950/95 border-4 border-amber-600 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[300px] my-auto animate-modal-pop">
        <h2
          className="text-amber-200 text-xl sm:text-3xl font-extrabold tracking-widest pt-1 text-center"
          style={{
            textShadow: '0 3px 6px rgba(0,0,0,0.9)',
            WebkitTextStroke: '0.75px #78350f',
            letterSpacing: '0.14em',
          }}
        >
          PERMAINAN JEDA
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 w-full my-3">
          <button
            id="pause-resume-btn"
            onClick={() => handleClick(onResume)}
            className="relative h-[42px] xs:h-[48px] sm:h-[54px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Lanjutkan"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-sm xs:text-base sm:text-lg font-bold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              Lanjutkan
            </span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => handleClick(onRestart)}
            className="relative h-[42px] xs:h-[48px] sm:h-[54px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Ulangi Level"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-xs xs:text-sm sm:text-base font-bold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              Ulangi Level
            </span>
          </button>

          <button
            id="pause-levels-btn"
            onClick={() => handleClick(onSelectLevel)}
            className="relative h-[42px] xs:h-[48px] sm:h-[54px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Pilih Level"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-xs xs:text-sm sm:text-base font-bold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              Pilih Level
            </span>
          </button>

          <button
            id="pause-menu-btn"
            onClick={() => handleClick(onGoToLobby)}
            className="relative h-[42px] xs:h-[48px] sm:h-[54px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Menu Utama"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-xs xs:text-sm sm:text-base font-bold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              Menu Utama
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
