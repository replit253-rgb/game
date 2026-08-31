import { UserProfile, AdminStats, AdminUserItem, LeaderboardPlayer, RewardData } from '../types';

const TOKEN_KEY = 'funiko_auth_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

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

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (err: any) {
      return { status: 'error', database: { connected: false, message: err.message } };
    }
  },

  // Auth
  async register(username: string, email: string, password: string, avatar: string = '🐻'): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, avatar }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Pendaftaran gagal');
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(identifier: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login gagal');
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: authHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async updateProfile(payload: { username?: string; avatar?: string }): Promise<UserProfile> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil');
    return data.user;
  },

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
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveLevelProgress(level: number, stars: number, score: number, timeSpentSeconds: number = 0) {
    try {
      const res = await fetch('/api/progress/level', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ level, stars, score, timeSpentSeconds }),
      });
      return await res.json();
    } catch (err) {
      console.warn('Could not sync level with server:', err);
    }
  },

  async saveRewardData(rewards: RewardData) {
    try {
      const res = await fetch('/api/progress/reward', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rewards),
      });
      return await res.json();
    } catch (err) {
      console.warn('Could not sync reward with server:', err);
    }
  },

  async resetUserProgress() {
    try {
      const res = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: authHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.warn('Could not reset progress on server:', err);
    }
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardPlayer[]> {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      return data.leaderboard || [];
    } catch {
      return [];
    }
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat statistik admin');
    return data;
  },

  async getAdminUsers(): Promise<AdminUserItem[]> {
    const res = await fetch('/api/admin/users', {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat pengguna');
    return data.users || [];
  },

  async getAdminUserDetail(userId: number): Promise<any> {
    const res = await fetch(`/api/admin/users/${userId}/detail`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat detail pengguna');
    return data;
  },

  async updateAdminUser(userId: number, update: { role?: string; coins?: number }) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengubah data pengguna');
    return data;
  },

  async resetAdminUserProgress(userId: number) {
    const res = await fetch(`/api/admin/users/${userId}/reset`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mereset progress pengguna');
    return data;
  },

  async deleteAdminUser(userId: number) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengguna');
    return data;
  },
};
