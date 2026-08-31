import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/api';
import { UserProfile } from '../types';
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus, ShieldAlert, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialTab?: 'login' | 'register';
  message?: string;
}

const AVATARS = ['🐻', '🦁', '🦉', '🦘', '🐨', '🦅', '🦆', '🐯'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
  message,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [identifier, setIdentifier] = useState(''); // username or email for login
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('🐻');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    soundFx.play('click');

    try {
      if (tab === 'login') {
        if (!identifier.trim() || !password) {
          throw new Error('Harap isi username/email dan kata sandi.');
        }
        const res = await api.login(identifier.trim(), password);
        soundFx.play('correct');
        onSuccess(res.user);
        onClose();
      } else {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('Semua bidang wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }
        if (password !== confirmPassword) {
          throw new Error('Konfirmasi kata sandi tidak cocok.');
        }
        const res = await api.register(username.trim(), email.trim(), password, avatar);
        soundFx.play('correct');
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      soundFx.play('wrong');
      setError(err?.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    soundFx.play('click');
    setTab('login');
    setIdentifier('admin@funiko.my.id');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 animate-fade-in backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-amber-950/95 border-4 border-amber-600 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center animate-modal-pop text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={() => {
            soundFx.play('click');
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-900/90 border-2 border-amber-500 text-amber-200 hover:text-white flex items-center justify-center transition-transform active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-800 border-2 border-yellow-400 flex items-center justify-center text-xl shadow-md">
            {tab === 'login' ? '🔑' : '✨'}
          </div>
          <div>
            <h3
              className="text-2xl font-extrabold text-amber-300"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '0.8px #78350f',
              }}
            >
              {tab === 'login' ? 'Masuk Petualang' : 'Daftar Akun Baru'}
            </h3>
            <p className="text-xs text-amber-200/90 font-medium">
              {tab === 'login' ? 'Lanjutkan petualangan & simpan prestasimu' : 'Simpan progress, koin & kartu hewanmu'}
            </p>
          </div>
        </div>

        {/* Informative Notice (e.g. when user clicks Mulai without logging in) */}
        {message && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-amber-900/90 border-2 border-yellow-400/80 text-yellow-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
            <KeyRound className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="w-full grid grid-cols-2 gap-2 p-1 bg-amber-900/80 rounded-2xl border-2 border-amber-700/80 mb-4">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              soundFx.play('click');
              setTab('login');
              setError(null);
            }}
            className={`py-2 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all ${
              tab === 'login'
                ? 'bg-amber-600 text-white shadow-md border border-yellow-300 scale-[1.02]'
                : 'text-amber-300/80 hover:text-amber-100'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </button>
          <button
            id="tab-register-btn"
            type="button"
            onClick={() => {
              soundFx.play('click');
              setTab('register');
              setError(null);
            }}
            className={`py-2 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all ${
              tab === 'register'
                ? 'bg-amber-600 text-white shadow-md border border-yellow-300 scale-[1.02]'
                : 'text-amber-300/80 hover:text-amber-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-900/90 border-2 border-red-500 rounded-2xl flex items-start gap-2 text-red-100 text-xs sm:text-sm font-semibold animate-shake">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {tab === 'login' ? (
            <>
              {/* Login Identifier */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Email atau Username</span>
                </label>
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  placeholder="Masukkan email / username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm sm:text-base"
                />
              </div>

              {/* Login Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kata Sandi</span>
                </label>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm sm:text-base"
                />
              </div>
            </>
          ) : (
            <>
              {/* Register: Avatar Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Pilih Karakter Avatar</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        soundFx.play('click');
                        setAvatar(av);
                      }}
                      className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        avatar === av
                          ? 'bg-amber-600 border-2 border-yellow-300 scale-110 shadow-lg'
                          : 'bg-amber-900/70 border border-amber-700/80 hover:bg-amber-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Register: Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Nama Pengguna</span>
                </label>
                <input
                  id="register-username-input"
                  type="text"
                  required
                  placeholder="Misal: RangerPetualang"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm"
                />
              </div>

              {/* Register: Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </label>
                <input
                  id="register-email-input"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm"
                />
              </div>

              {/* Register: Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kata Sandi (Min. 6 karakter)</span>
                </label>
                <input
                  id="register-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm"
                />
              </div>

              {/* Register: Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ulangi Kata Sandi</span>
                </label>
                <input
                  id="register-confirm-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-900/90 border-2 border-amber-600 text-white placeholder-amber-400/60 focus:outline-hidden focus:border-yellow-400 font-bold text-sm"
                />
              </div>
            </>
          )}

          {/* Action Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 border-2 border-yellow-400 text-white font-extrabold text-base sm:text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {tab === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{tab === 'login' ? 'Masuk Sekarang' : 'Daftar & Mainkan'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Admin Test Helper */}
        <div className="w-full mt-4 pt-3 border-t border-amber-800/80 flex flex-col items-center gap-2">
          <button
            id="auth-quick-admin-btn"
            type="button"
            onClick={fillAdminCredentials}
            className="text-xs text-yellow-300/90 hover:text-yellow-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/60 border border-yellow-500/40 transition-colors"
            title="Isi otomatis kredensial akun administrator default"
          >
            <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
            <span>Isi Akun Admin Default</span>
          </button>
          
          <p className="text-[11px] text-amber-400/70 text-center">
            Admin default: <span className="text-yellow-300 font-mono">admin@funiko.my.id</span> / <span className="text-yellow-300 font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
};
