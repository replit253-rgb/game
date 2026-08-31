import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/api';
import { UserProfile, RewardData } from '../types';
import { PRESET_LEVELS } from '../data/animals';
import {
  User,
  X,
  Star,
  Coins,
  Award,
  Shield,
  Calendar,
  Edit2,
  Check,
  LogOut,
  Layers,
  Trophy,
  Lock,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface ProfileModalProps {
  currentUser: UserProfile | null;
  completedLevels: Record<number, number>;
  rewards: RewardData;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenAdmin?: () => void;
}

const AVATAR_OPTIONS = [
  '🦁', '🐯', '🐻', '🐼', '🦊', '🐨',
  '🐵', '🐶', '🐱', '🐸', '🦄', '🦅',
  '🦧', '🐘', '🦏', '🦜', '🦉', '🐬'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  completedLevels,
  rewards,
  onClose,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser?.avatar || '🦁');
  const [usernameInput, setUsernameInput] = useState<string>(currentUser?.username || 'Pemain Tamu');
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stats calculation
  const totalStarsEarned = Object.values(completedLevels).reduce((sum, s) => sum + s, 0);
  const levelsCount = Object.keys(completedLevels).length;
  const cardsCount = rewards?.unlockedCards?.length || 0;

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    if (!usernameInput.trim()) {
      setErrorMessage('Nama pengguna tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      soundFx.play('click');
      const updated = await api.updateProfile({
        username: usernameInput.trim(),
        avatar: selectedAvatar,
      });

      onUpdateUser(updated);
      setIsEditingUsername(false);
      setSaveSuccessMessage('Profil berhasil diperbarui!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan perubahan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Hari ini';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-amber-950/95 border-4 border-amber-600 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b-2 border-amber-700/80 bg-amber-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-600/40 border-2 border-amber-400 flex items-center justify-center text-amber-200 font-bold text-xl shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-amber-200 flex items-center gap-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                Profil Pemain
                {currentUser?.role === 'admin' && (
                  <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-amber-300/80 font-medium">
                {currentUser ? 'Kelola akun & pantau progres 5 level petualanganmu' : 'Status Akun Tamu & Progres Game'}
              </p>
            </div>
          </div>

          <button
            id="profile-modal-close-btn"
            onClick={() => {
              soundFx.play('click');
              onClose();
            }}
            className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-800 transition-colors cursor-pointer border border-amber-600/50"
            title="Tutup Profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Notifications */}
          {saveSuccessMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-950/90 border-2 border-red-500/80 text-red-200 text-xs font-bold flex items-center gap-2 shadow-lg">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Account Card */}
          {currentUser ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-900/40 border-2 border-amber-700/60 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Current Avatar Display */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-4xl shadow-xl">
                    {selectedAvatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[10px] bg-amber-950 border border-amber-500 px-1.5 py-0.5 rounded-full text-yellow-300 font-bold">
                    Pilih 👇
                  </span>
                </div>

                {/* User Details & Editable Username */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {isEditingUsername ? (
                      <div className="flex items-center gap-1.5 w-full max-w-xs">
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full bg-amber-950 border-2 border-yellow-400 rounded-xl px-3 py-1 text-sm font-bold text-white focus:outline-hidden"
                          autoFocus
                          maxLength={20}
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                          title="Simpan Nama"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-extrabold text-white tracking-tight">
                          {currentUser.username}
                        </h3>
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="p-1 text-amber-300 hover:text-yellow-200 transition-colors cursor-pointer"
                          title="Ubah Nama Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-amber-200/80 font-medium">{currentUser.email}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-amber-300/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Bergabung: {formatDate(currentUser.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="text-yellow-300 font-bold">ID: #{currentUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Avatar Selector Grid */}
              <div className="space-y-2 pt-2 border-t border-amber-800/80">
                <span className="text-xs font-bold text-amber-200 block">
                  Pilih Karakter Satwa Favoritmu:
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundFx.play('click');
                        setSelectedAvatar(emoji);
                      }}
                      className={`h-11 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === emoji
                          ? 'bg-amber-600/60 border-2 border-yellow-300 scale-105 shadow-md shadow-yellow-500/30'
                          : 'bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/80'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save changes button if avatar changed */}
              {selectedAvatar !== currentUser.avatar && (
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 border border-yellow-200"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Avatar ({selectedAvatar})</span>
                </button>
              )}
            </div>
          ) : (
            /* Guest State Banner */
            <div className="p-5 rounded-3xl bg-amber-900/40 border-2 border-amber-700/70 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/30 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto">
                🦁
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Kamu Belum Masuk Akun</h3>
                <p className="text-xs text-amber-200/80 max-w-md mx-auto mt-1 font-medium">
                  Masuk atau daftar akun Funiko sekarang agar seluruh progres bintang, kartu satwa, dan koin tersimpan di server PostgreSQL secara permanen!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogIn className="w-4 h-4 text-yellow-400" />
                  <span>Masuk Akun</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('register');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Gratis</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Stars */}
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border-2 border-amber-700/60 flex flex-col items-center text-center shadow-md">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-yellow-400 flex items-center justify-center mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold">Total Bintang</span>
              <p className="text-base font-extrabold text-yellow-300 mt-0.5">{totalStarsEarned} / 15 ⭐</p>
            </div>

            {/* Levels Cleared */}
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border-2 border-amber-700/60 flex flex-col items-center text-center shadow-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold">Level Selesai</span>
              <p className="text-base font-extrabold text-emerald-300 mt-0.5">{levelsCount} / 5 Level</p>
            </div>

            {/* Coins */}
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border-2 border-amber-700/60 flex flex-col items-center text-center shadow-md">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-1">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold">Saldo Koin</span>
              <p className="text-base font-extrabold text-yellow-300 mt-0.5">{currentUser ? currentUser.coins.toLocaleString() : (rewards.coins || 0).toLocaleString()} 🪙</p>
            </div>

            {/* Cards Unlocked */}
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border-2 border-amber-700/60 flex flex-col items-center text-center shadow-md">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-1">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold">Kartu Satwa</span>
              <p className="text-base font-extrabold text-purple-300 mt-0.5">{cardsCount} Kartu</p>
            </div>
          </div>

          {/* 5-Level Progress Breakdown Map */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-900/40 border-2 border-amber-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-yellow-400" />
                Rincian Bintang 5 Level Petualangan
              </h4>
              <span className="text-xs text-yellow-300 font-bold">
                {levelsCount === 5 ? '🎉 Semua Level Tuntas!' : `${5 - levelsCount} Level Tersisa`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {PRESET_LEVELS.map((lvl) => {
                const stars = completedLevels[lvl.level] || 0;
                const isCleared = stars > 0;
                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                      isCleared
                        ? 'bg-amber-950/80 border-yellow-400/70 text-yellow-200 shadow-md'
                        : 'bg-amber-950/40 border-amber-800/70 text-amber-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="w-6 h-6 rounded-lg bg-amber-800 text-[11px] font-black flex items-center justify-center text-amber-100">
                        L{lvl.level}
                      </span>
                      <span className="text-[10px] font-bold">
                        {isCleared ? 'Lulus' : 'Terkunci'}
                      </span>
                    </div>

                    <p className="text-xs font-extrabold text-white truncate w-full mt-0.5">
                      {lvl.name}
                    </p>

                    <div className="flex items-center gap-0.5 mt-2">
                      {isCleared ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-amber-950 text-amber-800'
                            }`}
                          />
                        ))
                      ) : (
                        <span className="text-[10px] text-amber-400/70 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t-2 border-amber-800 bg-amber-950/90 flex items-center justify-between flex-wrap gap-2">
          {currentUser?.role === 'admin' && onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600/40 hover:bg-amber-600/60 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 text-yellow-300" />
              <span>Buka Admin Dashboard</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={() => {
                soundFx.play('click');
                onClose();
                onLogout();
              }}
              className="ml-auto px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundFx.play('click');
                onClose();
              }}
              className="ml-auto px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
