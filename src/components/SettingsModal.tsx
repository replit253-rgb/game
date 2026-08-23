import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Mic, MicOff, RefreshCw, BookOpen, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onResetProgress: () => void;
  completedLevels: Record<number, number>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onResetProgress,
  completedLevels,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'guide' | 'data'>('audio');
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [volume, setVolume] = useState(soundFx.getMasterVolume());
  const [speechEnabled, setSpeechEnabled] = useState(soundFx.isSpeechEnabled());
  const [speechRate, setSpeechRate] = useState(soundFx.getSpeechRate());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleTabChange = (tab: 'audio' | 'guide' | 'data') => {
    soundFx.play('click');
    setActiveTab(tab);
  };

  const handleMuteToggle = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.play('click');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundFx.setMasterVolume(newVol);
  };

  const handleTestSound = () => {
    soundFx.play('correct');
    if (speechEnabled) {
      setTimeout(() => {
        soundFx.speakText('Tes suara Funiko Game!');
      }, 300);
    }
  };

  const handleSpeechToggle = () => {
    soundFx.play('click');
    const newSpeech = !speechEnabled;
    setSpeechEnabled(newSpeech);
    soundFx.setSpeechEnabled(newSpeech);
    if (newSpeech) {
      soundFx.speakText('Pengucapan nama hewan diaktifkan');
    }
  };

  const handleRateChange = (rate: number) => {
    soundFx.play('click');
    setSpeechRate(rate);
    soundFx.setSpeechRate(rate);
    soundFx.speakText('Kecepatan bicara diubah');
  };

  const handleConfirmReset = () => {
    soundFx.play('click');
    onResetProgress();
    setShowConfirmReset(false);
  };

  // Calculate stats
  const totalCompleted = Object.keys(completedLevels).length;
  const totalStars = Object.values(completedLevels).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-amber-950 border-4 border-amber-600 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b-2 border-amber-800 bg-amber-900/80">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-widest flex items-center gap-2"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              WebkitTextStroke: '0.5px #78350f',
              letterSpacing: '0.1em',
            }}
          >
            <Sliders className="w-7 h-7 text-amber-400" />
            <span>PENGATURAN GAME</span>
          </h2>
          <button
            id="settings-close-btn"
            onClick={() => {
              soundFx.play('click');
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-800 bg-amber-950/80">
          <button
            id="settings-tab-audio"
            onClick={() => handleTabChange('audio')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'audio'
                ? 'bg-amber-800/90 text-amber-300 border-b-4 border-amber-400'
                : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-amber-100'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Suara & Audio</span>
          </button>

          <button
            id="settings-tab-guide"
            onClick={() => handleTabChange('guide')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'guide'
                ? 'bg-amber-800/90 text-amber-300 border-b-4 border-amber-400'
                : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-amber-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Petunjuk Main</span>
          </button>

          <button
            id="settings-tab-data"
            onClick={() => handleTabChange('data')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'data'
                ? 'bg-amber-800/90 text-amber-300 border-b-4 border-amber-400'
                : 'text-amber-200/70 hover:bg-amber-900/40 hover:text-amber-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Data Progres</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-5 text-amber-100">
          {/* TAB 1: AUDIO & SUARA */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Audio Master Mute Toggle */}
              <div className="flex items-center justify-between bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4">
                <div>
                  <div className="font-extrabold text-amber-200 text-base sm:text-lg">Efek Suara & Musik</div>
                  <div className="text-xs text-amber-300/80">Atur suara latar dan efek tombol dalam game</div>
                </div>
                <button
                  id="settings-mute-toggle"
                  onClick={handleMuteToggle}
                  className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
                    isMuted
                      ? 'bg-red-900/80 border border-red-500 text-red-200'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                  <span>{isMuted ? 'Muted (Mati)' : 'Suara Aktif'}</span>
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-200 text-base">Volume Suara</span>
                  <span className="font-bold text-amber-400">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="settings-volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-500 h-2 bg-amber-950 rounded-lg cursor-pointer"
                  />
                  <button
                    id="settings-test-sound-btn"
                    onClick={handleTestSound}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs whitespace-nowrap shadow transition-transform active:scale-95"
                  >
                    Tes Suara
                  </button>
                </div>
              </div>

              {/* Speech Synthesis Toggle */}
              <div className="flex items-center justify-between bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4">
                <div>
                  <div className="font-extrabold text-amber-200 text-base sm:text-lg">Pengucapan Nama Hewan</div>
                  <div className="text-xs text-amber-300/80">Suara bahasa Indonesia mengucapkan nama hewan yang dipilih</div>
                </div>
                <button
                  id="settings-speech-toggle"
                  onClick={handleSpeechToggle}
                  className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
                    !speechEnabled
                      ? 'bg-stone-800 border border-stone-600 text-stone-300'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {!speechEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-200" />}
                  <span>{speechEnabled ? 'Suara Bicara On' : 'Suara Bicara Off'}</span>
                </button>
              </div>

              {/* Speech Rate Control */}
              {speechEnabled && (
                <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 space-y-2">
                  <div className="font-extrabold text-amber-200 text-base">Kecepatan Bicara</div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { label: 'Lambat', rate: 0.6 },
                      { label: 'Normal', rate: 0.9 },
                      { label: 'Cepat', rate: 1.3 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        id={`settings-speechrate-${item.label}`}
                        onClick={() => handleRateChange(item.rate)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                          Math.abs(speechRate - item.rate) < 0.1
                            ? 'bg-amber-500 text-amber-950 font-extrabold shadow-md scale-105'
                            : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PETUNJUK MAIN */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 space-y-3">
                <h3 className="font-extrabold text-amber-300 text-lg flex items-center gap-2">
                  <span>🎯 Cara Mencocokkan Hewan</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  Ada 2 cara mudah bermain yang disukai anak-anak:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-800/60">
                    <div className="font-bold text-amber-300 text-sm mb-1">1. Metode Drag & Drop</div>
                    <div className="text-xs text-amber-200/80">Tarik papan nama di bawah dan lepaskan di slot nama di bawah gambar hewan.</div>
                  </div>
                  <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-800/60">
                    <div className="font-bold text-amber-300 text-sm mb-1">2. Metode Ketuk (Tap)</div>
                    <div className="text-xs text-amber-200/80">Ketuk salah satu papan nama di bawah, lalu ketuk slot hewan yang sesuai!</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 space-y-2">
                <h3 className="font-extrabold text-amber-300 text-lg flex items-center gap-2">
                  <span>❤️ Sistem Nyawa & Bintang</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  Kamu memiliki <strong className="text-red-400">3 Hati Nyawa</strong> di setiap level. Tebakan yang salah akan mengurangi 1 hati. Selesaikan level tanpa salah untuk mendapatkan <strong className="text-yellow-400">3 Bintang Sempurna!</strong>
                </p>
              </div>

              <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 space-y-2">
                <h3 className="font-extrabold text-amber-300 text-lg flex items-center gap-2">
                  <span>🐾 Galeri Satwa Ensiklopedia</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  Buka menu <strong>&quot;Galeri Hewan&quot;</strong> dari menu utama untuk mempelajari 20 spesies hewan unik, mendengarkan suara nama mereka, dan membaca fakta unik!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DATA PROGRES */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              {/* Current Progress Summary */}
              <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4">
                <h3 className="font-extrabold text-amber-300 text-lg mb-3">Ringkasan Progres Kamu</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-800">
                    <div className="text-2xl font-extrabold text-amber-400">{totalCompleted} / 5</div>
                    <div className="text-xs text-amber-200/80 mt-1">Level Diselesaikan</div>
                  </div>
                  <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-800">
                    <div className="text-2xl font-extrabold text-yellow-400">⭐ {totalStars}</div>
                    <div className="text-xs text-amber-200/80 mt-1">Total Bintang Terkumpul</div>
                  </div>
                </div>
              </div>

              {/* Reset Data Option */}
              <div className="bg-red-950/40 border border-red-900/80 rounded-2xl p-4 space-y-3">
                <div>
                  <div className="font-extrabold text-red-300 text-base sm:text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Reset Seluruh Progres Game</span>
                  </div>
                  <div className="text-xs text-red-200/80 mt-1">
                    Hapus catatan level yang telah selesai dan bintang untuk memulai dari awal.
                  </div>
                </div>

                {!showConfirmReset ? (
                  <button
                    id="settings-reset-init-btn"
                    onClick={() => {
                      soundFx.play('click');
                      setShowConfirmReset(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Data Progres</span>
                  </button>
                ) : (
                  <div className="bg-red-900/90 border border-red-500 rounded-xl p-3 space-y-3 animate-fade-in text-center">
                    <div className="text-xs sm:text-sm font-bold text-white">
                      ⚠️ Yakin ingin menghapus semua bintang & progres level? Tindakan ini tidak bisa dibatalkan!
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="settings-reset-cancel-btn"
                        onClick={() => {
                          soundFx.play('click');
                          setShowConfirmReset(false);
                        }}
                        className="flex-1 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs"
                      >
                        Batal
                      </button>
                      <button
                        id="settings-reset-confirm-btn"
                        onClick={handleConfirmReset}
                        className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
                      >
                        Ya, Reset Sekarang!
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-amber-900/60 border-t border-amber-800 text-center text-xs text-amber-300/80 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan tersimpan otomatis di perangkat</span>
        </div>
      </div>
    </div>
  );
};
