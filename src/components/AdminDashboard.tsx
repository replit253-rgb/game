import React, { useState, useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { api } from '../utils/api';
import { AdminStats, AdminUserItem, UserProfile, Animal } from '../types';
import { ALL_ANIMALS, PRESET_LEVELS } from '../data/animals';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Star,
  Coins,
  ArrowLeft,
  RefreshCw,
  Shield,
  ShieldAlert,
  Trash2,
  Search,
  RotateCcw,
  Activity,
  CheckCircle2,
  BarChart3,
  X,
  Eye,
  Calendar,
  ChevronRight,
  Gamepad2,
  BookOpen,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: UserProfile;
  onBackToGame: () => void;
  onRefreshUserData?: () => void;
}

type TabType = 'dashboard' | 'users' | 'leaderboard' | 'animals';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onBackToGame,
  onRefreshUserData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Tertutup secara default saat baru dibuka
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'player'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'stars' | 'coins' | 'level'>('newest');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User detail modal & edit modal state
  const [inspectingUser, setInspectingUser] = useState<AdminUserItem | null>(null);
  const [inspectingUserDetail, setInspectingUserDetail] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [coinModalUser, setCoinModalUser] = useState<AdminUserItem | null>(null);
  const [coinInputAmount, setCoinInputAmount] = useState<number>(250);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, leaderboardData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getLeaderboard(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      showNotification('Gagal memuat data admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  const handleOpenUserDetail = async (userItem: AdminUserItem) => {
    setInspectingUser(userItem);
    setInspectLoading(true);
    try {
      const detail = await api.getAdminUserDetail(userItem.id);
      setInspectingUserDetail(detail);
    } catch (err) {
      console.warn('Gagal memuat detail user:', err);
      setInspectingUserDetail({
        user: userItem,
        completedLevels: {},
        coins: userItem.coins,
        rewards: { openedChests: {}, unlockedCards: [], claimedBadges: [] },
      });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'player' : 'admin';
    const confirmed = window.confirm(`Ubah role pengguna ini menjadi ${newRole.toUpperCase()}?`);
    if (!confirmed) return;

    try {
      await api.updateAdminUser(userId, { role: newRole as 'admin' | 'player' });
      showNotification(`Role pengguna berhasil diubah menjadi ${newRole}`, 'success');
      fetchDashboardData();
      onRefreshUserData?.();
      if (inspectingUser && inspectingUser.id === userId) {
        setInspectingUser({ ...inspectingUser, role: newRole as 'admin' | 'player' });
      }
    } catch (err) {
      showNotification('Gagal mengubah role pengguna.', 'error');
    }
  };

  const handleAddCoins = async (userId: number, currentCoins: number, amountToAdd: number) => {
    try {
      const newTotal = Math.max(0, currentCoins + amountToAdd);
      await api.updateAdminUser(userId, { coins: newTotal });
      showNotification(`Berhasil memperbarui koin (Total: ${newTotal})!`, 'success');
      fetchDashboardData();
      onRefreshUserData?.();
      setCoinModalUser(null);
      if (inspectingUser && inspectingUser.id === userId) {
        setInspectingUser({ ...inspectingUser, coins: newTotal });
      }
    } catch (err) {
      showNotification('Gagal memperbarui koin.', 'error');
    }
  };

  const handleResetUserProgress = async (userId: number, username: string) => {
    const confirmed = window.confirm(`Reset seluruh progress level dan koin untuk pemain "${username}"?`);
    if (!confirmed) return;

    try {
      await api.resetAdminUserProgress(userId);
      showNotification(`Progress pemain "${username}" telah direset.`, 'success');
      fetchDashboardData();
      onRefreshUserData?.();
      if (inspectingUser && inspectingUser.id === userId) {
        handleOpenUserDetail(inspectingUser);
      }
    } catch (err) {
      showNotification('Gagal mereset progress.', 'error');
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    const confirmed = window.confirm(`HAPUS AKUN "${username}" secara permanen? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;

    try {
      await api.deleteAdminUser(userId);
      showNotification(`Pengguna "${username}" berhasil dihapus.`, 'success');
      setInspectingUser(null);
      fetchDashboardData();
      onRefreshUserData?.();
    } catch (err: any) {
      showNotification(err?.message || 'Gagal menghapus pengguna.', 'error');
    }
  };

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const query = searchQuery.toLowerCase();
        const matchSearch =
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          String(u.id).includes(query);
        const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
        return matchSearch && matchRole;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.starsCount - a.starsCount;
        if (sortBy === 'coins') return b.coins - a.coins;
        if (sortBy === 'level') return b.maxLevel - a.maxLevel;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [users, searchQuery, selectedRoleFilter, sortBy]);

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      description: 'Statistik & Ringkasan Game',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'users' as TabType,
      label: 'User (Pengguna)',
      description: 'Daftar & Data Semua Pemain',
      icon: Users,
      badge: users.length.toString(),
    },
    {
      id: 'leaderboard' as TabType,
      label: 'Leaderboard',
      description: 'Peringkat Bintang Pemain',
      icon: Trophy,
      badge: null,
    },
    {
      id: 'animals' as TabType,
      label: 'Katalog Satwa',
      description: '20 Database Satwa Game',
      icon: BookOpen,
      badge: '20',
    },
  ];

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full h-full min-h-screen min-h-dvh bg-slate-950 text-slate-100 flex overflow-hidden font-sans select-text">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl border flex items-center gap-2.5 animate-bounce ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : 'bg-red-950/95 border-red-500 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ===================== SIDEBAR ===================== */}
      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
                🦁
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Funiko Admin
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    PRO
                  </span>
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sistem Aktif & Terhubung
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              id="sidebar-close-btn"
              onClick={() => {
                soundFx.play('click');
                setIsSidebarOpen(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Menu Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1.5">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    soundFx.play('click');
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all group ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-md font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                      }`}
                    />
                    <div>
                      <span className="text-sm block">{item.label}</span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-amber-500 text-amber-950'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Admin Account Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  Super Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            id="sidebar-back-to-game-btn"
            onClick={() => {
              soundFx.play('click');
              onBackToGame();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Permainan</span>
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              id="admin-sidebar-toggle-btn"
              onClick={() => {
                soundFx.play('click');
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title={isSidebarOpen ? 'Tutup Menu Sidebar' : 'Buka Menu Sidebar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-amber-400" />
              ) : (
                <PanelLeft className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden sm:inline font-bold">
                {isSidebarOpen ? 'Tutup Menu' : 'Menu Sidebar'}
              </span>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 capitalize">
                {activeTab === 'dashboard' && '📊 Dashboard Ringkasan'}
                {activeTab === 'users' && '👥 Data Pengguna (User)'}
                {activeTab === 'leaderboard' && '🏆 Papan Peringkat (Leaderboard)'}
                {activeTab === 'animals' && '🐾 Database Satwa Edukasi'}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                {activeTab === 'dashboard' && 'Pantau ringkasan statistik dan aktivitas 5 level game Funiko'}
                {activeTab === 'users' && 'Lihat semua user yang terdaftar beserta data progres lengkap 5 level'}
                {activeTab === 'leaderboard' && 'Peringkat 50 pemain terbaik dengan bintang & skor tertinggi'}
                {activeTab === 'animals' && 'Daftar 20 satwa edukasi nusantara dalam game Funiko'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-refresh-data-btn"
              onClick={() => {
                soundFx.play('click');
                fetchDashboardData();
              }}
              disabled={loading}
              className="h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-200 transition-all active:scale-95 disabled:opacity-50"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* 1. PAGE: DASHBOARD */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total User */}
                <div
                  onClick={() => setActiveTab('users')}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      User Terdaftar
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {users.length}
                    </span>
                    <span className="text-xs text-blue-400 font-bold flex items-center gap-0.5">
                      Lihat User <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Total Stars */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Total Bintang
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300">
                      {stats?.totalStars || 0}
                    </span>
                    <span className="text-xs text-slate-400">Maks 15 ⭐ per pemain</span>
                  </div>
                </div>

                {/* Total Games Played */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Sesi Dimainkan
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                      {stats?.totalGamesPlayed || 0}
                    </span>
                    <span className="text-xs text-emerald-400/80 font-bold">Total Bermain</span>
                  </div>
                </div>

                {/* Total Coins in Circulation */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Koin Beredar
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">
                      {(stats?.totalCoins || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-yellow-400/80">Koin Reward</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Level Completion & Recent Users */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Level Completion Distribution - Exactly 5 Levels matching PRESET_LEVELS */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black text-white">
                        Distribusi Penyelesaian Level (Level 1 - 5)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      Total 5 Level Game
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Jumlah pemain yang berhasil menyelesaikan masing-masing level dari 5 level utama game:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                    {PRESET_LEVELS.map((levelConfig) => {
                      const lvl = levelConfig.level;
                      const count = stats?.levelDistribution?.[lvl] || 0;
                      const maxPlayerCount = Math.max(...Object.values(stats?.levelDistribution || {}), users.length || 1);
                      const percentage = Math.min(100, Math.round((count / maxPlayerCount) * 100));

                      return (
                        <div
                          key={lvl}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-black flex items-center justify-center border border-amber-500/30">
                                L{lvl}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {levelConfig.animalCount} Satwa
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-200">
                              {levelConfig.name}
                            </h4>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-800/80">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="text-xs font-black text-emerald-400">
                                {count} <span className="text-[10px] text-slate-400 font-normal">pemain</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">{percentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick User List Widget (1 col) */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-black text-white">User Terdaftar Terbaru</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                      >
                        Semua
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {users.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setActiveTab('users');
                            handleOpenUserDetail(user);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg">{user.avatar}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{user.username}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {user.starsCount}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {user.maxLevel > 0 ? `Lvl ${user.maxLevel}/5` : 'Belum main'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Buka Halaman Kelola User ({users.length})</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white">Log Aktivitas Permainan Terbaru</h3>
                  </div>
                  <span className="text-xs text-slate-400">Real-time Game Logs</span>
                </div>

                {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Pemain</th>
                          <th className="py-2.5 px-3">Level Selesai</th>
                          <th className="py-2.5 px-3">Bintang Diraih</th>
                          <th className="py-2.5 px-3">Skor</th>
                          <th className="py-2.5 px-3">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                        {stats.recentLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-white">
                              {log.username || 'Pemain Tamu'}
                            </td>
                            <td className="py-2.5 px-3 text-amber-300 font-bold">
                              Level {log.level}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {log.stars} Bintang
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">
                              +{log.score} poin
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {formatDate(log.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat aktivitas permainan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. PAGE: USER (Melihat data user yang mendaftar di game) */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    Data Pengguna Terdaftar ({users.length} Akun)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kelola dan lihat rincian data seluruh user yang mendaftar di game Funiko: progres 5 level, perolehan bintang, saldo koin, role, serta waktu pendaftaran.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                    <span>Total Pemain: {users.filter((u) => u.role === 'player').length}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <span>Admin: {users.filter((u) => u.role === 'admin').length}</span>
                  </div>
                </div>
              </div>

              {/* Controls: Search, Role Filter, Sorting */}
              <div className="flex flex-col md:flex-row items-center gap-3 justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-search-user-input"
                    type="text"
                    placeholder="Cari nama, email, atau ID user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters and Sorters */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-end">
                  {/* Role filter */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['all', 'admin', 'player'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                          selectedRoleFilter === r
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r === 'all' ? 'Semua' : r}
                      </button>
                    ))}
                  </div>

                  {/* Sort By Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="newest">📅 Terbaru Mendaftar</option>
                    <option value="stars">⭐ Bintang Terbanyak</option>
                    <option value="coins">🪙 Koin Terbanyak</option>
                    <option value="level">🚩 Level Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* User List Table */}
              <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Pengguna (User)</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Tanggal Daftar</th>
                        <th className="py-3 px-4">Progres Level & Bintang</th>
                        <th className="py-3 px-4">Koin</th>
                        <th className="py-3 px-4 text-center">Aksi / Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* User & Email */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                                  {user.avatar}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-sm">
                                      {user.username}
                                    </span>
                                    <span className="text-[10px] text-slate-400">#{user.id}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 block font-normal">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                                  user.role === 'admin'
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {user.role === 'admin' ? (
                                  <Shield className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <Users className="w-3 h-3 text-slate-400" />
                                )}
                                {user.role}
                              </span>
                            </td>

                            {/* Created At */}
                            <td className="py-3 px-4 text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatDate(user.createdAt)}</span>
                              </div>
                            </td>

                            {/* Stars & Level */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {user.starsCount} Bintang
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    ({user.levelsCompletedCount}/5 Level)
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Level Tertinggi: <strong className="text-slate-200">{user.maxLevel > 0 ? `Level ${user.maxLevel}/5` : 'Belum main'}</strong>
                                </div>
                              </div>
                            </td>

                            {/* Coins */}
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-sm font-black text-yellow-300">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                {user.coins.toLocaleString()}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Detail Button */}
                                <button
                                  id={`admin-view-user-${user.id}`}
                                  onClick={() => handleOpenUserDetail(user)}
                                  className="p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 transition-all active:scale-95 cursor-pointer"
                                  title="Lihat Data Detail Progres"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Coins Button */}
                                <button
                                  id={`admin-edit-coins-${user.id}`}
                                  onClick={() => setCoinModalUser(user)}
                                  className="p-2 rounded-xl bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-700/60 text-yellow-300 transition-all active:scale-95 cursor-pointer"
                                  title="Kelola Saldo Koin"
                                >
                                  <Coins className="w-4 h-4" />
                                </button>

                                {/* Toggle Admin Role */}
                                <button
                                  id={`admin-toggle-role-${user.id}`}
                                  onClick={() => handleUpdateRole(user.id, user.role)}
                                  className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 transition-all active:scale-95 cursor-pointer"
                                  title={user.role === 'admin' ? 'Ubah ke Player' : 'Jadikan Admin'}
                                >
                                  <Shield className="w-4 h-4" />
                                </button>

                                {/* Reset Progress */}
                                <button
                                  id={`admin-reset-user-${user.id}`}
                                  onClick={() => handleResetUserProgress(user.id, user.username)}
                                  className="p-2 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-700/60 text-orange-300 transition-all active:scale-95 cursor-pointer"
                                  title="Reset Progres Permainan"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>

                                {/* Delete User (Disabled for self) */}
                                {user.id !== currentUser.id && (
                                  <button
                                    id={`admin-delete-user-${user.id}`}
                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                    className="p-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 transition-all active:scale-95 cursor-pointer"
                                    title="Hapus Akun Pengguna"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Tidak ada pengguna yang cocok dengan pencarian & filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PAGE: LEADERBOARD */}
          {/* ======================================================== */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Peringkat Pemain Funiko (Top 50)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Daftar pemain dengan perolehan bintang & level terbanyak dari total 5 level game.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-center">Rank</th>
                        <th className="py-3 px-4">Pemain</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Level Selesai</th>
                        <th className="py-3 px-4">Total Bintang</th>
                        <th className="py-3 px-4">Koin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((player, idx) => (
                          <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 text-center font-black text-sm">
                              {idx === 0 && <span className="text-2xl">🥇</span>}
                              {idx === 1 && <span className="text-2xl">🥈</span>}
                              {idx === 2 && <span className="text-2xl">🥉</span>}
                              {idx > 2 && <span className="text-slate-400">#{idx + 1}</span>}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{player.avatar}</span>
                                <span className="font-bold text-white text-sm">{player.username}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {player.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-bold">
                              {player.levelsCleared} / 5 Level
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-black text-amber-300 text-sm">
                                <Star className="w-4 h-4 fill-amber-400" />
                                {player.totalStars}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-yellow-300 font-bold">
                              {player.coins.toLocaleString()} 🪙
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400">
                            Belum ada data peringkat pemain.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. PAGE: KATALOG SATWA */}
          {/* ======================================================== */}
          {activeTab === 'animals' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    Katalog Satwa Edukasi Nusantara (20 Satwa)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Daftar lengkap 20 satwa dan suara fauna yang digunakan di 5 level game Funiko.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {ALL_ANIMALS.map((animal: Animal, idx: number) => (
                  <div
                    key={animal.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center group hover:border-amber-500/50 transition-all shadow-md"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 mb-2 group-hover:scale-110 transition-transform">
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-300">Satwa #{idx + 1}</span>
                    <h4 className="text-sm font-black text-white">{animal.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{animal.habitat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== USER DETAIL INSPECT MODAL ===================== */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                  {inspectingUser.avatar}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{inspectingUser.username}</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        inspectingUser.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {inspectingUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{inspectingUser.email} • ID: #{inspectingUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {inspectLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Memuat detail data pemain...</span>
                </div>
              ) : (
                <>
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bintang</span>
                      <p className="text-lg font-black text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {inspectingUser.starsCount}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Level Tertinggi</span>
                      <p className="text-lg font-black text-emerald-300 mt-0.5">
                        {inspectingUser.maxLevel > 0 ? `Level ${inspectingUser.maxLevel} / 5` : 'Belum Main'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo Koin</span>
                      <p className="text-lg font-black text-yellow-300 flex items-center justify-center gap-1 mt-0.5">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        {inspectingUser.coins.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Level Progress Map - Exactly 5 Levels */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Progres Bintang (5 Level Utama):</span>
                      <span className="text-slate-400">
                        {Object.keys(inspectingUserDetail?.completedLevels || {}).length} / 5 Level Selesai
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {PRESET_LEVELS.map((levelConfig) => {
                        const lvl = levelConfig.level;
                        const stars = inspectingUserDetail?.completedLevels?.[lvl] || 0;
                        return (
                          <div
                            key={lvl}
                            className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                              stars > 0
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                                : 'bg-slate-950 border-slate-800/80 text-slate-500'
                            }`}
                          >
                            <span className="text-xs font-black">Level {lvl}</span>
                            <span className="text-[10px] truncate max-w-full font-semibold">
                              {levelConfig.name.split('(')[1]?.replace(')', '') || `Lvl ${lvl}`}
                            </span>
                            <div className="mt-1.5 flex items-center gap-1">
                              {stars > 0 ? (
                                Array.from({ length: stars }).map((_, si) => (
                                  <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-500">Belum Selesai</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards & Koleksi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-slate-300">Peti Hadiah Dibuka:</h5>
                      <p className="text-slate-400">
                        {Object.keys(inspectingUserDetail?.rewards?.openedChests || {}).length} Peti level telah diklaim.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-slate-300">Kartu Koleksi Satwa:</h5>
                      <p className="text-slate-400">
                        {(inspectingUserDetail?.rewards?.unlockedCards || []).length} / 20 Kartu Satwa terkumpul.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCoinModalUser(inspectingUser);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Beri Koin</span>
                </button>

                <button
                  onClick={() => handleUpdateRole(inspectingUser.id, inspectingUser.role)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ubah Role ({inspectingUser.role === 'admin' ? 'Jadikan Player' : 'Jadikan Admin'})</span>
                </button>
              </div>

              <button
                onClick={() => handleResetUserProgress(inspectingUser.id, inspectingUser.username)}
                className="px-3 py-1.5 rounded-xl bg-orange-950 hover:bg-orange-900 border border-orange-800 text-orange-300 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Progres</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== COIN EDIT MODAL ===================== */}
      {coinModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Kelola Koin Pemain
              </h3>
              <button
                onClick={() => setCoinModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Pemain: <strong className="text-white">{coinModalUser.username}</strong> ({coinModalUser.email})<br />
              Saldo Koin Saat Ini: <strong className="text-yellow-300">{coinModalUser.coins.toLocaleString()} 🪙</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Tambah Jumlah Koin:</label>
              <input
                type="number"
                value={coinInputAmount}
                onChange={(e) => setCoinInputAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-hidden focus:border-amber-500"
              />

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCoinInputAmount(amt)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCoinModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddCoins(coinModalUser.id, coinModalUser.coins, coinInputAmount)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
              >
                Simpan & Tambahkan Koin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
