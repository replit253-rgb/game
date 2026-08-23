import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, BookOpen, HelpCircle, Sliders, Coins } from 'lucide-react';
import { EncyclopediaModal } from './EncyclopediaModal';
import { SettingsModal } from './SettingsModal';
import { getRewardData } from '../utils/rewardStorage';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onResetProgress: () => void;
  onOpenRewards: () => void;
  completedLevels: Record<number, number>;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onResetProgress,
  onOpenRewards,
  completedLevels,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const rewardData = getRewardData();

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.play('click');
    }
  };

  const handleStart = () => {
    soundFx.play('click');
    onOpenLevelSelect();
  };

  const handleQuickPlay = () => {
    soundFx.play('click');
    onStartGame();
  };

  const handleOpenSettings = () => {
    soundFx.play('click');
    setShowSettings(true);
  };

  return (
    <div className="relative w-full min-h-screen min-h-dvh overflow-y-auto flex flex-col items-center justify-between p-2.5 xs:p-4 sm:p-8 select-none">
      {/* Background Graphic */}
      <img
        src="/assets/BG.png"
        alt="Funiko Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none filter brightness-95"
      />

      {/* Decorative & Interactive Animal Pictures on Main Page */}
      {/* Left Animal: Beruang */}
      <div 
        onClick={() => soundFx.play('pop')}
        className="fixed left-1 xs:left-3 sm:left-6 md:left-10 lg:left-16 bottom-2 sm:bottom-6 z-10 w-20 xs:w-28 sm:w-40 md:w-48 lg:w-56 cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95 animate-float pointer-events-auto"
        title="Halo! Ketuk aku!"
      >
        <img
          src="/assets/Object/Beruang.png"
          alt="Beruang"
          className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:rotate-6"
        />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-900/90 border border-amber-500 text-yellow-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          Beruang 🐻
        </span>
      </div>

      {/* Right Animal: Kangguru */}
      <div 
        onClick={() => soundFx.play('pop')}
        className="fixed right-1 xs:right-3 sm:right-6 md:right-10 lg:right-16 bottom-2 sm:bottom-6 z-10 w-20 xs:w-28 sm:w-40 md:w-48 lg:w-56 cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95 animate-float pointer-events-auto"
        style={{ animationDelay: '1.2s' }}
        title="Halo! Ketuk aku!"
      >
        <img
          src="/assets/Object/kangguru.png"
          alt="Kangguru"
          className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-rotate-6"
        />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-900/90 border border-amber-500 text-yellow-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          Kangguru 🦘
        </span>
      </div>

      {/* Top Left Animal Badge: Burung Beo */}
      <div 
        onClick={() => soundFx.play('pop')}
        className="fixed left-2 sm:left-8 top-16 sm:top-20 z-10 w-14 xs:w-20 sm:w-28 cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95 animate-playful hidden sm:block pointer-events-auto"
        title="Burung Beo"
      >
        <img
          src="/assets/Object/Burung_Beo.png"
          alt="Burung Beo"
          className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:rotate-12"
        />
      </div>

      {/* Top Right Animal Badge: Koala */}
      <div 
        onClick={() => soundFx.play('pop')}
        className="fixed right-2 sm:right-8 top-16 sm:top-20 z-10 w-14 xs:w-20 sm:w-28 cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95 animate-playful hidden sm:block pointer-events-auto"
        style={{ animationDelay: '0.8s' }}
        title="Koala"
      >
        <img
          src="/assets/Object/Koala.png"
          alt="Koala"
          className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:-rotate-12"
        />
      </div>

      {/* Top Utility Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Audio Mute Toggle */}
          <button
            id="menu-sound-toggle-btn"
            onClick={toggleSound}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-lg transition-transform active:scale-90 min-w-[40px] min-h-[40px]"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Settings Top Icon Button */}
          <button
            id="menu-settings-top-btn"
            onClick={handleOpenSettings}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-lg transition-transform active:scale-90 min-w-[40px] min-h-[40px]"
            title="Pengaturan Game"
          >
            <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Galeri Satwa */}
          <button
            id="menu-encyclopedia-btn"
            onClick={() => {
              soundFx.play('click');
              setShowEncyclopedia(true);
            }}
            className="h-10 sm:h-12 px-2.5 sm:px-4 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center gap-1.5 shadow-lg transition-transform active:scale-90 font-bold text-xs sm:text-base min-h-[40px]"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Galeri</span>
          </button>

          {/* Reward & Koin Badge Shortcut */}
          <button
            id="menu-reward-shortcut-btn"
            onClick={() => {
              soundFx.play('click');
              onOpenRewards();
            }}
            className="h-10 sm:h-12 px-2 sm:px-3.5 rounded-2xl bg-amber-900/90 hover:bg-amber-800 border-2 border-yellow-400 text-yellow-300 flex items-center gap-1 shadow-lg transition-transform active:scale-90 font-bold text-xs sm:text-base min-h-[40px]"
            title="Menu Reward & Koin"
          >
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span>{rewardData.coins}</span>
          </button>
        </div>

        {/* Bantuan / How To Play */}
        <button
          id="menu-howtoplay-btn"
          onClick={() => {
            soundFx.play('click');
            setShowHowToPlay(true);
          }}
          className="h-10 sm:h-12 px-2.5 sm:px-4 rounded-2xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center gap-1 sm:gap-2 shadow-lg transition-transform active:scale-90 font-bold text-xs sm:text-base min-h-[40px]"
        >
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Bantuan</span>
        </button>
      </div>

      {/* Center Logo and Play Buttons */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2 w-full max-w-lg">
        {/* Game Logo */}
        <div className="w-full max-w-[260px] xs:max-w-[340px] sm:max-w-[480px] mb-2 xs:mb-4 sm:mb-6 animate-playful">
          <img
            src="/assets/FunikoJudul.png"
            alt="Funiko Game"
            className="w-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 w-full max-w-[260px] xs:max-w-[290px] sm:max-w-[330px]">
          {/* MULAI (Pilih Level) */}
          <button
            id="menu-mulai-btn"
            onClick={handleStart}
            className="relative w-full h-[52px] xs:h-[58px] sm:h-[72px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group touch-manipulation animate-cta-pulse rounded-2xl"
          >
            <img
              src="/assets/Tombol_Mulai.png"
              alt="Mulai"
              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-xl"
              onError={(e) => {
                // Fallback to Btn_.png if Tombol_Mulai.png fails
                (e.target as HTMLImageElement).src = '/assets/Btn_.png';
              }}
            />
            <span
              className="relative z-10 text-white text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.14em',
              }}
            >
              MULAI
            </span>
          </button>

          {/* MAIN CEPAT (Level 1 Langsung) */}
          <button
            id="menu-quickplay-btn"
            onClick={handleQuickPlay}
            className="relative w-full h-[46px] xs:h-[52px] sm:h-[62px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          >
            <img
              src="/assets/Btn_.png"
              alt="Main Cepat"
              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg"
            />
            <span
              className="relative z-10 text-amber-100 text-base xs:text-lg sm:text-xl font-extrabold tracking-widest"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              Main Level 1
            </span>
          </button>

          {/* REWARD & PETI HADIAH BUTTON */}
          <button
            id="menu-reward-main-btn"
            onClick={() => {
              soundFx.play('click');
              onOpenRewards();
            }}
            className="relative w-full h-[46px] xs:h-[52px] sm:h-[62px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          >
            <img
              src="/assets/Btn_.png"
              alt="Reward & Peti"
              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg"
            />
            <span
              className="relative z-10 text-yellow-200 text-base xs:text-lg sm:text-xl font-extrabold tracking-widest flex items-center gap-1.5"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              REWARD & PETI
            </span>
          </button>

          {/* PENGATURAN BUTTON */}
          <button
            id="menu-settings-btn"
            onClick={handleOpenSettings}
            className="relative w-full h-[46px] xs:h-[52px] sm:h-[62px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          >
            <img
              src="/assets/Btn_.png"
              alt="Pengaturan"
              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg"
            />
            <span
              className="relative z-10 text-amber-100 text-base xs:text-lg sm:text-xl font-extrabold tracking-widest flex items-center gap-1.5"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.1em',
              }}
            >
              PENGATURAN
            </span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-10 text-amber-200/90 font-bold text-xs sm:text-sm tracking-widest text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
        Tebak & Pasangkan Nama Hewan yang Tepat! 🦁🐼🦉
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onResetProgress={onResetProgress}
          completedLevels={completedLevels}
        />
      )}

      {/* Galeri Hewan Modal */}
      {showEncyclopedia && (
        <EncyclopediaModal onClose={() => setShowEncyclopedia(false)} />
      )}

      {/* Cara Bermain Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-amber-950/95 border-4 border-amber-600 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h3
              className="text-2xl font-extrabold text-amber-300 mb-4"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '1px #78350f',
              }}
            >
              📖 Cara Bermain
            </h3>
            <ul className="text-left text-amber-100 space-y-3 text-sm sm:text-base font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Lihat gambar hewan yang muncul di bagian atas layar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Tarik (drag) atau ketuk papan nama hewan di bagian bawah.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Pasangkan ke slot kayu di bawah gambar hewan yang sesuai.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Hati-hati! Jika salah menebak, nyawamu (❤️) akan berkurang!</span>
              </li>
            </ul>

            <button
              id="howtoplay-close-btn"
              onClick={() => {
                soundFx.play('click');
                setShowHowToPlay(false);
              }}
              className="mt-6 px-6 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg shadow-lg transition-transform active:scale-95"
            >
              Mengerti!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
