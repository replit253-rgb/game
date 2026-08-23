import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ChestRewardResult } from '../types';
import { soundFx } from '../utils/audio';
import { Coins, Volume2 } from 'lucide-react';

interface ChestOpenModalProps {
  reward: ChestRewardResult;
  onClose: () => void;
}

export const ChestOpenModal: React.FC<ChestOpenModalProps> = ({ reward, onClose }) => {
  const [isOpenAnimation, setIsOpenAnimation] = useState(false);

  useEffect(() => {
    // Play opening sound and trigger confetti after brief chest bounce
    const timer = setTimeout(() => {
      setIsOpenAnimation(true);
      soundFx.play('win_coin');
      soundFx.play('win');

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ec4899', '#3b82f6'],
        });
      } catch {
        // ignore if confetti fails
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleSpeakName = () => {
    soundFx.speakText(reward.card.name);
  };

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'Diamond':
        return {
          bg: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600',
          text: 'Berlian (Diamond)',
          border: 'border-cyan-300',
          glow: 'shadow-cyan-500/50',
        };
      case 'Gold':
        return {
          bg: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600',
          text: 'Emas (Gold)',
          border: 'border-yellow-200',
          glow: 'shadow-yellow-500/50',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-slate-400 to-slate-600',
          text: 'Perak (Silver)',
          border: 'border-slate-300',
          glow: 'shadow-slate-400/50',
        };
    }
  };

  const rarityInfo = getRarityBadge(reward.card.rarity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center p-6 text-center">
        {/* Shiny aura background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-amber-600/30 rounded-3xl filter blur-2xl animate-pulse" />

        {/* Modal Container */}
        <div className="relative z-10 w-full bg-amber-950/90 border-4 border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
          {/* Header Title */}
          <div className="flex items-center gap-2 mb-2">
            <h2
              className="text-yellow-300 text-2xl sm:text-3xl font-black tracking-widest"
              style={{
                textShadow: '0 3px 6px rgba(0,0,0,0.9)',
                WebkitTextStroke: '1px #78350f',
                letterSpacing: '0.12em',
              }}
            >
              HADIAH PETI MISTERI!
            </h2>
          </div>

          <p className="text-amber-100 text-xs sm:text-sm font-bold mb-4">
            Selamat! Kamu membuka Hadiah Level {reward.level}!
          </p>

          {/* Unlocking animation presentation */}
          {!isOpenAnimation ? (
            <div className="my-8 flex flex-col items-center animate-bounce">
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-amber-800/80 rounded-2xl border-4 border-yellow-400 flex items-center justify-center shadow-2xl">
                <span className="text-amber-100 font-extrabold text-base sm:text-xl">PETI LVL {reward.level}</span>
              </div>
              <span className="text-yellow-300 font-bold mt-3 text-sm animate-pulse">
                Membuka Peti Hadiah...
              </span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-fade-in">
              {/* Coin Reward Banner */}
              <div className="w-full bg-gradient-to-r from-amber-900/90 via-yellow-900/90 to-amber-900/90 border-2 border-yellow-400/80 rounded-2xl p-2.5 mb-4 flex items-center justify-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-amber-950 text-xl font-bold shadow-inner">
                  <Coins className="w-6 h-6 text-amber-950" />
                </div>
                <div className="text-left">
                  <span className="text-amber-200 text-xs font-semibold block">Bonus Koin Emas:</span>
                  <span className="text-yellow-300 text-xl font-black drop-shadow">
                    +{reward.coins} Koin!
                  </span>
                </div>
              </div>

              {/* Card Reward Display */}
              <div className="w-full bg-amber-900/70 border-2 border-amber-500 rounded-2xl p-4 flex flex-col items-center relative shadow-xl mb-5">
                {/* Rarity Badge */}
                <div
                  className={`absolute -top-3 px-3 py-0.5 rounded-full text-[11px] font-extrabold text-white border ${rarityInfo.border} ${rarityInfo.bg} ${rarityInfo.glow} shadow-md uppercase tracking-wider`}
                >
                  {rarityInfo.text}
                </div>

                <div className="w-28 h-28 sm:w-36 sm:h-36 relative flex items-center justify-center my-2">
                  <img
                    src={reward.card.image}
                    alt={reward.card.name}
                    className="w-full h-full object-contain filter drop-shadow-xl transform hover:scale-110 transition-transform"
                  />
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <h3
                    className="text-amber-100 text-lg sm:text-2xl font-extrabold"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {reward.card.name}
                  </h3>
                  {reward.card.englishName && (
                    <span className="text-amber-300 text-xs italic font-semibold">
                      ({reward.card.englishName})
                    </span>
                  )}
                  <button
                    onClick={handleSpeakName}
                    className="p-1 rounded-full bg-amber-800 hover:bg-amber-700 text-amber-200 transition-colors"
                    title="Dengar Nama"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-amber-200/90 text-xs italic mt-1 text-center px-2">
                  &quot;{reward.card.funFact}&quot;
                </div>
              </div>

              {/* Claim Action Button */}
              <button
                id="chest-claim-btn"
                onClick={onClose}
                className="relative w-full h-[50px] sm:h-[56px] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[44px]"
              >
                <img
                  src="/assets/Btn_.png"
                  alt="Klaim Hadiah"
                  className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg"
                />
                <span
                  className="relative z-10 text-white text-base sm:text-lg font-bold tracking-widest flex items-center justify-center"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '0.5px #451a03',
                    letterSpacing: '0.12em',
                  }}
                >
                  SIMPAN KE KOLEKSI
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
