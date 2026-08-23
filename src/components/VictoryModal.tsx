import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';

interface VictoryModalProps {
  levelNumber: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onSelectLevel: () => void;
  heartsLeft: number;
  onOpenRewards?: (level: number) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onSelectLevel,
  heartsLeft,
  onOpenRewards,
}) => {
  useEffect(() => {
    // Fire festive confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const interval = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);

    return () => clearTimeout(interval);
  }, []);

  const handleClick = (callback: () => void) => {
    soundFx.play('click');
    callback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-amber-950/95 border-4 border-amber-600 rounded-3xl p-3 xs:p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[320px] my-auto animate-modal-pop">
        {/* Header Title */}
        <div className="text-center pt-1">
          <h2
            className="text-amber-300 text-2xl xs:text-3xl sm:text-4xl font-extrabold tracking-widest animate-bounce"
            style={{
              textShadow: '0 4px 6px rgba(0,0,0,0.9), 0 0 12px rgba(245,158,11,0.8)',
              WebkitTextStroke: '0.75px #78350f',
              letterSpacing: '0.14em',
            }}
          >
            HEBAT!
          </h2>
          <p className="text-white text-xs xs:text-sm sm:text-lg font-bold mt-0.5 tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.08em' }}>
            Level {levelNumber} Berhasil Diselesaikan!
          </p>
        </div>

        {/* Star Rating based on hearts left */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 sm:my-3">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`transition-all duration-500 transform ${
                star <= heartsLeft ? 'scale-110 text-yellow-400' : 'scale-90 text-stone-600 opacity-60'
              }`}
            >
              <svg
                className="w-8 h-8 xs:w-10 xs:h-10 sm:w-16 sm:h-16 fill-current filter drop-shadow-lg"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {/* Open Peti & Menu Reward Button */}
          {onOpenRewards && (
            <button
              id="victory-open-chest-btn"
              onClick={() => handleClick(() => onOpenRewards(levelNumber))}
              className="relative w-full h-[46px] xs:h-[52px] sm:h-[62px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px] animate-pulse"
            >
              <img
                src="/assets/Btn_.png"
                alt="Buka Peti Reward"
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg"
              />
              <span
                className="relative z-10 text-yellow-200 text-xs xs:text-sm sm:text-lg font-black tracking-widest flex items-center gap-1.5"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px #451a03',
                  letterSpacing: '0.08em',
                }}
              >
                Buka Peti & Menu Reward
              </span>
            </button>
          )}

          {hasNextLevel ? (
            <button
              id="victory-next-btn"
              onClick={() => handleClick(onNextLevel)}
              className="relative w-full h-[44px] xs:h-[50px] sm:h-[62px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
            >
              <img
                src="/assets/Btn_.png"
                alt="Lanjut Level"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <span
                className="relative z-10 text-white text-xs xs:text-sm sm:text-xl font-bold tracking-widest"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px #451a03',
                  letterSpacing: '0.08em',
                }}
              >
                Lanjut Level Berikutnya ➔
              </span>
            </button>
          ) : null}

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              id="victory-replay-btn"
              onClick={() => handleClick(onReplay)}
              className="relative h-[42px] xs:h-[48px] sm:h-[56px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
            >
              <img
                src="/assets/Btn_.png"
                alt="Main Lagi"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <span
                className="relative z-10 text-white text-xs sm:text-base font-bold tracking-widest"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px #451a03',
                  letterSpacing: '0.08em',
                }}
              >
                Main Lagi
              </span>
            </button>

            <button
              id="victory-level-select-btn"
              onClick={() => handleClick(onSelectLevel)}
              className="relative h-[42px] xs:h-[48px] sm:h-[56px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[40px]"
            >
              <img
                src="/assets/Btn_.png"
                alt="Pilih Level"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <span
                className="relative z-10 text-white text-xs sm:text-base font-bold tracking-widest"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px #451a03',
                  letterSpacing: '0.08em',
                }}
              >
                Pilih Level
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
