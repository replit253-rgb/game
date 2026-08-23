import React from 'react';
import { soundFx } from '../utils/audio';

interface GameOverModalProps {
  onRetry: () => void;
  onSelectLevel: () => void;
  onGoToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onSelectLevel,
  onGoToLobby,
}) => {
  const handleClick = (callback: () => void) => {
    soundFx.play('click');
    callback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm sm:max-w-md bg-amber-950/95 border-4 border-amber-600 rounded-3xl p-3 xs:p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[280px] my-auto animate-modal-pop">
        {/* Game Over Title */}
        <div className="w-3/4 max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] pt-1 xs:pt-2 animate-bounce">
          <img
            src="/assets/Game Over.png"
            alt="Game Over"
            className="w-full object-contain drop-shadow-lg"
          />
        </div>

        <p className="text-amber-100 text-xs xs:text-sm sm:text-xl font-bold text-center px-2 my-2 sm:my-3 tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.08em' }}>
          Jangan menyerah! Coba tebak sekali lagi!
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3 w-full">
          {/* Lobby / Menu Utama */}
          <button
            id="gameover-lobby-btn"
            onClick={() => handleClick(onGoToLobby)}
            className="relative h-[42px] xs:h-[48px] sm:h-[58px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Lobby"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-[11px] xs:text-xs sm:text-lg font-bold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.08em',
              }}
            >
              Lobby
            </span>
          </button>

          {/* Pilih Level */}
          <button
            id="gameover-level-btn"
            onClick={() => handleClick(onSelectLevel)}
            className="relative h-[42px] xs:h-[48px] sm:h-[58px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Pilih Level"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-white text-[10px] xs:text-xs sm:text-base font-bold whitespace-nowrap px-0.5 tracking-wider"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.08em',
              }}
            >
              Pilih Level
            </span>
          </button>

          {/* Coba Lagi */}
          <button
            id="gameover-retry-btn"
            onClick={() => handleClick(onRetry)}
            className="relative h-[42px] xs:h-[48px] sm:h-[58px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
          >
            <img
              src="/assets/Btn_.png"
              alt="Coba Lagi"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className="relative z-10 text-yellow-200 text-[10px] xs:text-xs sm:text-base font-extrabold whitespace-nowrap px-0.5 tracking-wider"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.08em',
              }}
            >
              Coba Lagi
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
