import { UserProfile, AdminStats, AdminUserItem, LeaderboardPlayer, RewardData } from '../types';
import { getRewardData, saveRewardData } from './rewardStorage';

const TOKEN_KEY = 'funiko_auth_token';
const LOCAL_CURRENT_USER_KEY = 'funiko_current_user_profile';
const LOCAL_USERS_DB_KEY = 'funiko_local_users_db';

// Helper to get stored auth token
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper to save or remove auth token
export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
};

// Helper to get local user profile
export const getLocalUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Helper to set local user profile
export const setLocalUser = (user: UserProfile | null) => {
  try {
    if (user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    }
  } catch {
    // ignore
  }
};

// Get all offline registered users
const getLocalUsersDb = (): Array<UserProfile & { passwordHash?: string }> => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    if (!raw) {
      // Default offline seed accounts
      const defaultUsers: Array<UserProfile & { passwordHash?: string }> = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@funiko.my.id',
          role: 'admin',
          avatar: '👑',
          coins: 1000,
          createdAt: new Date().toISOString(),
          passwordHash: 'admin123',
        },
      ];
      localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Save offline registered users
const saveLocalUsersDb = (users: Array<UserProfile & { passwordHash?: string }>) => {
  try {
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe JSON parser to avoid "Unexpected end of JSON input" errors
async function parseResponseSafely(res: Response): Promise<{ ok: boolean; status: number; data: any; isJson: boolean }> {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  let isJson = false;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
      isJson = true;
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      try {
        data = JSON.parse(text);
        isJson = true;
      } catch {
        data = text ? { raw: text } : null;
      }
    } catch {
      data = null;
    }
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
    isJson,
  };
}

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch('/api/health');
      const parsed = await parseResponseSafely(res);
      if (parsed.isJson && parsed.data) {
        return parsed.data;
      }
      return { status: 'ok', database: { connected: false, message: 'Standalone Local Mode' } };
    } catch (err: any) {
      return { status: 'ok', database: { connected: false, message: 'Standalone Local Mode' } };
    }
  },

  // Auth: Register
  async register(username: string, email: string, password: string, avatar: string = '🐻'): Promise<{ user: UserProfile; token: string }> {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password, avatar }),
      });

      const parsed = await parseResponseSafely(res);

      // If server responded with JSON
      if (parsed.isJson && parsed.data) {
        if (!parsed.ok) {
          throw new Error(parsed.data.error || 'Pendaftaran gagal');
        }
        if (parsed.data.token) {
          setAuthToken(parsed.data.token);
        }
        if (parsed.data.user) {
          setLocalUser(parsed.data.user);
        }
        return parsed.data;
      }

      // If server returned 404 (e.g. static hosting on custom domain like funiko.my.id) or non-JSON:
      if (parsed.status === 404 || !parsed.isJson) {
        console.warn('[Funiko Auth] Backend API returned 404 or non-JSON. Falling back to Local Storage Auth.');
        return this.localRegister(cleanUsername, cleanEmail, password, avatar);
      }

      throw new Error(parsed.data?.error || `Pendaftaran gagal (Status: ${parsed.status})`);
    } catch (err: any) {
      // If network error / connection refused or server offline
      if (err.message && !err.message.includes('sudah terdaftar') && !err.message.includes('minimal 6 karakter')) {
        console.warn('[Funiko Auth] Network error contacting API. Falling back to Local Storage Auth:', err);
        return this.localRegister(cleanUsername, cleanEmail, password, avatar);
      }
      throw err;
    }
  },

  // Offline / Local Register Fallback
  localRegister(username: string, email: string, password: string, avatar: string = '🐻'): { user: UserProfile; token: string } {
    const users = getLocalUsersDb();

    // Check existing
    const existing = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error('Nama pengguna atau email sudah terdaftar.');
    }

    const isAdmin = email.toLowerCase().includes('admin') || username.toLowerCase() === 'admin';
    const newUser: UserProfile & { passwordHash?: string } = {
      id: Date.now(),
      username,
      email,
      role: isAdmin ? 'admin' : 'player',
      avatar: avatar || '🐻',
      coins: 100, // Welcome bonus
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    users.push(newUser);
    saveLocalUsersDb(users);

    const token = `local_token_${newUser.id}_${Date.now()}`;
    const userProfile: UserProfile = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      coins: newUser.coins,
      createdAt: newUser.createdAt,
    };

    setAuthToken(token);
    setLocalUser(userProfile);

    return { user: userProfile, token };
  },

  // Auth: Login
  async login(identifier: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const cleanId = identifier.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });

      const parsed = await parseResponseSafely(res);

      if (parsed.isJson && parsed.data) {
        if (!parsed.ok) {
          throw new Error(parsed.data.error || 'Login gagal');
        }
        if (parsed.data.token) {
          setAuthToken(parsed.data.token);
        }
        if (parsed.data.user) {
          setLocalUser(parsed.data.user);
        }
        return parsed.data;
      }

      // If server returned 404 / offline: Fall back to local authentication
      if (parsed.status === 404 || !parsed.isJson) {
        console.warn('[Funiko Auth] Backend API returned 404 or non-JSON. Falling back to Local Storage Auth.');
        return this.localLogin(cleanId, password);
      }

      throw new Error(parsed.data?.error || `Login gagal (Status: ${parsed.status})`);
    } catch (err: any) {
      if (err.message && !err.message.includes('tidak ditemukan') && !err.message.includes('tidak sesuai')) {
        console.warn('[Funiko Auth] Network error contacting API. Falling back to Local Storage Auth:', err);
        return this.localLogin(cleanId, password);
      }
      throw err;
    }
  },

  // Offline / Local Login Fallback
  localLogin(identifier: string, password: string): { user: UserProfile; token: string } {
    const users = getLocalUsersDb();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      throw new Error('Akun tidak ditemukan. Periksa email atau username Anda.');
    }

    if (user.passwordHash && user.passwordHash !== password) {
      throw new Error('Kata sandi tidak sesuai.');
    }

    const token = `local_token_${user.id}_${Date.now()}`;
    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      coins: user.coins,
      createdAt: user.createdAt,
    };

    setAuthToken(token);
    setLocalUser(userProfile);

    return { user: userProfile, token };
  },

  // Auth: Get Current Profile
  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);

      if (parsed.ok && parsed.isJson && parsed.data?.user) {
        setLocalUser(parsed.data.user);
        return parsed.data.user;
      }
      return getLocalUser();
    } catch {
      return getLocalUser();
    }
  },

  // Auth: Update Profile
  async updateProfile(payload: { username?: string; avatar?: string }): Promise<UserProfile> {
    let updatedLocalUser: UserProfile | null = null;
    const currentUser = getLocalUser();

    if (currentUser) {
      updatedLocalUser = {
        ...currentUser,
        ...(payload.username ? { username: payload.username.trim() } : {}),
        ...(payload.avatar ? { avatar: payload.avatar } : {}),
      };
      setLocalUser(updatedLocalUser);

      // Also update in offline DB
      const users = getLocalUsersDb();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updatedLocalUser };
        saveLocalUsersDb(users);
      }
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && parsed.data?.user) {
        setLocalUser(parsed.data.user);
        return parsed.data.user;
      }
    } catch {
      // Backend offline, return local update
    }

    if (updatedLocalUser) return updatedLocalUser;
    throw new Error('Gagal memperbarui profil.');
  },

  // Auth: Logout
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setLocalUser(null);
    }
  },

  // Progress Sync
  async getProgress(): Promise<{
    completedLevels: Record<number, number>;
    coins: number;
    rewards: RewardData;
  } | null> {
    try {
      const res = await fetch('/api/progress', {
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && parsed.data) {
        return parsed.data;
      }
    } catch {
      // ignore
    }

    // Offline progress fallback from localStorage
    try {
      const storedLevels = localStorage.getItem('funiko_completed_levels');
      const completedLevels = storedLevels ? JSON.parse(storedLevels) : {};
      const rewards = getRewardData();
      const currentUser = getLocalUser();
      return {
        completedLevels,
        coins: currentUser ? currentUser.coins : rewards.coins,
        rewards,
      };
    } catch {
      return null;
    }
  },

  async saveLevelProgress(level: number, stars: number, score: number, timeSpentSeconds: number = 0) {
    // Save to local storage first
    try {
      const storedLevels = localStorage.getItem('funiko_completed_levels');
      const levels = storedLevels ? JSON.parse(storedLevels) : {};
      levels[level] = Math.max(levels[level] || 0, stars);
      localStorage.setItem('funiko_completed_levels', JSON.stringify(levels));
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/progress/level', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ level, stars, score, timeSpentSeconds }),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch (err) {
      console.warn('Could not sync level with server:', err);
    }
  },

  async saveRewardData(rewards: RewardData) {
    saveRewardData(rewards);

    // Sync coins with current local user
    const currentUser = getLocalUser();
    if (currentUser && currentUser.coins !== rewards.coins) {
      currentUser.coins = rewards.coins;
      setLocalUser(currentUser);
    }

    try {
      const res = await fetch('/api/progress/reward', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rewards),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch (err) {
      console.warn('Could not sync reward with server:', err);
    }
  },

  async resetUserProgress() {
    try {
      localStorage.removeItem('funiko_completed_levels');
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch (err) {
      console.warn('Could not reset progress on server:', err);
    }
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardPlayer[]> {
    try {
      const res = await fetch('/api/leaderboard');
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && Array.isArray(parsed.data?.leaderboard)) {
        return parsed.data.leaderboard;
      }
    } catch {
      // ignore
    }

    // Offline / Local Leaderboard
    const currentUser = getLocalUser();
    const storedLevels = localStorage.getItem('funiko_completed_levels');
    const completedLevels = storedLevels ? JSON.parse(storedLevels) : {};
    const totalStars = Object.values(completedLevels).reduce((a: number, b: any) => a + Number(b || 0), 0);

    const defaultLeaderboard: LeaderboardPlayer[] = [
      {
        id: currentUser ? currentUser.id : 1,
        username: currentUser ? currentUser.username : 'Pemain Juara',
        avatar: currentUser ? currentUser.avatar : '🐻',
        coins: currentUser ? currentUser.coins : 350,
        totalStars: totalStars || 12,
        totalScore: (totalStars || 12) * 100,
        levelsCleared: Object.keys(completedLevels).length || 4,
        role: currentUser?.role || 'player',
      },
      {
        id: 901,
        username: 'RimbaMaster',
        avatar: '🦁',
        coins: 850,
        totalStars: 15,
        totalScore: 1500,
        levelsCleared: 5,
        role: 'player',
      },
      {
        id: 902,
        username: 'GarudaSakti',
        avatar: '🦅',
        coins: 620,
        totalStars: 14,
        totalScore: 1400,
        levelsCleared: 5,
        role: 'player',
      },
      {
        id: 903,
        username: 'KangarooLompat',
        avatar: '🦘',
        coins: 480,
        totalStars: 11,
        totalScore: 1100,
        levelsCleared: 4,
        role: 'player',
      },
    ];

    return defaultLeaderboard.sort((a, b) => b.totalStars - a.totalStars || b.coins - a.coins);
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && parsed.data) {
        return parsed.data;
      }
    } catch {
      // ignore
    }

    const users = getLocalUsersDb();
    return {
      totalUsers: users.length,
      totalGamesPlayed: 10,
      totalStars: 15,
      totalCoins: users.reduce((sum, u) => sum + (u.coins || 0), 0),
      levelDistribution: { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 },
      recentLogs: [],
    };
  },

  async getAdminUsers(): Promise<AdminUserItem[]> {
    try {
      const res = await fetch('/api/admin/users', {
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && Array.isArray(parsed.data?.users)) {
        return parsed.data.users;
      }
    } catch {
      // ignore
    }

    const users = getLocalUsersDb();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      coins: u.coins,
      createdAt: u.createdAt || new Date().toISOString(),
      levelsCompletedCount: 0,
      maxLevel: 1,
      starsCount: 0,
    }));
  },

  async getAdminUserDetail(userId: number): Promise<any> {
    try {
      const res = await fetch(`/api/admin/users/${userId}/detail`, {
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.isJson && parsed.data) {
        return parsed.data;
      }
    } catch {
      // ignore
    }

    const users = getLocalUsersDb();
    const user = users.find((u) => u.id === userId);
    return {
      user: user || null,
      progress: [],
      rewards: getRewardData(),
      summary: {
        levelsCompleted: 0,
        totalStars: 0,
        totalScore: 0,
      },
    };
  },

  async updateAdminUser(userId: number, update: { role?: string; coins?: number }) {
    const users = getLocalUsersDb();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      if (update.role && (update.role === 'admin' || update.role === 'player')) {
        users[idx].role = update.role;
      }
      if (typeof update.coins === 'number') {
        users[idx].coins = update.coins;
      }
      saveLocalUsersDb(users);
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(update),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch {
      return { message: 'Pengguna berhasil diperbarui.' };
    }
  },

  async resetAdminUserProgress(userId: number) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch {
      return { message: 'Progress pengguna berhasil direset.' };
    }
  },

  async deleteAdminUser(userId: number) {
    const users = getLocalUsersDb();
    const filtered = users.filter((u) => u.id !== userId);
    saveLocalUsersDb(filtered);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const parsed = await parseResponseSafely(res);
      return parsed.data;
    } catch {
      return { message: 'Pengguna berhasil dihapus.' };
    }
  },
};
