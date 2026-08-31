import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { db, sql, checkDatabaseConnection } from './index';
import * as schema from './schema';
import { eq, desc, count, or } from 'drizzle-orm';

// Unified Data Interface for User, Progress, Rewards, Logs
export interface UserRecord {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'player';
  avatar: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressRecord {
  id: number;
  userId: number;
  level: number;
  stars: number;
  score: number;
  completedAt: string;
}

export interface RewardRecord {
  id: number;
  userId: number;
  openedChests: Record<number, boolean>;
  unlockedCards: string[];
  claimedBadges: string[];
  updatedAt: string;
}

export interface GameLogRecord {
  id: number;
  userId?: number | null;
  username?: string | null;
  level: number;
  stars: number;
  score: number;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface UserWithStats {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'player';
  avatar: string;
  coins: number;
  starsCount: number;
  maxLevel: number;
  levelsCompletedCount: number;
  createdAt: string;
}

// Fallback JSON-backed storage for seamless preview operation when PostgreSQL is not configured
const DATA_FILE = path.join(process.cwd(), '.funiko_data.json');

interface FallbackState {
  users: UserRecord[];
  progress: ProgressRecord[];
  rewards: RewardRecord[];
  logs: GameLogRecord[];
  nextUserId: number;
  nextProgressId: number;
  nextLogId: number;
}

let memoryState: FallbackState = {
  users: [],
  progress: [],
  rewards: [],
  logs: [],
  nextUserId: 1,
  nextProgressId: 1,
  nextLogId: 1,
};

function loadFallbackData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryState = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Storage] Could not read fallback file, using fresh state.');
  }

  // Ensure default admin user exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@funiko.my.id';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const existingAdmin = memoryState.users.find(
    (u) => u.email.toLowerCase() === adminEmail.toLowerCase() || u.username.toLowerCase() === 'admin'
  );

  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    const adminUser: UserRecord = {
      id: memoryState.nextUserId++,
      username: 'admin',
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
      avatar: '🦁',
      coins: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryState.users.push(adminUser);
    memoryState.rewards.push({
      id: 1,
      userId: adminUser.id,
      openedChests: {},
      unlockedCards: [],
      claimedBadges: [],
      updatedAt: new Date().toISOString(),
    });
    saveFallbackData();
  }
}

function saveFallbackData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryState, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Initialize on module load
loadFallbackData();

export const dataStore = {
  async isPostgresOnline(): Promise<boolean> {
    if (!sql || !db) return false;
    const status = await checkDatabaseConnection();
    return status.connected;
  },

  async findUserById(id: number): Promise<UserRecord | null> {
    if (await this.isPostgresOnline()) {
      try {
        const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
        if (u) {
          return {
            ...u,
            role: u.role as 'admin' | 'player',
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn('[Postgres Query Failed, falling back to local store]:', err);
      }
    }
    return memoryState.users.find((u) => u.id === id) || null;
  },

  async findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
    const cleanId = identifier.trim().toLowerCase();

    if (await this.isPostgresOnline()) {
      try {
        const [u] = await db
          .select()
          .from(schema.users)
          .where(or(eq(schema.users.email, identifier), eq(schema.users.username, identifier)))
          .limit(1);

        if (u) {
          return {
            ...u,
            role: u.role as 'admin' | 'player',
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn('[Postgres Query Failed, falling back to local store]:', err);
      }
    }

    return (
      memoryState.users.find(
        (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
      ) || null
    );
  },

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'player';
    avatar: string;
    coins: number;
  }): Promise<UserRecord> {
    if (await this.isPostgresOnline()) {
      try {
        const [newUser] = await db
          .insert(schema.users)
          .values({
            username: data.username,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role,
            avatar: data.avatar,
            coins: data.coins,
          })
          .returning();

        await db.insert(schema.userRewards).values({
          userId: newUser.id,
          openedChests: {},
          unlockedCards: [],
          claimedBadges: [],
        });

        return {
          ...newUser,
          role: newUser.role as 'admin' | 'player',
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('[Postgres Insert Failed, falling back to local store]:', err);
      }
    }

    const newUser: UserRecord = {
      id: memoryState.nextUserId++,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      avatar: data.avatar,
      coins: data.coins,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryState.users.push(newUser);
    memoryState.rewards.push({
      id: memoryState.nextUserId,
      userId: newUser.id,
      openedChests: {},
      unlockedCards: [],
      claimedBadges: [],
      updatedAt: new Date().toISOString(),
    });

    saveFallbackData();
    return newUser;
  },

  async getUserProgress(userId: number): Promise<{
    completedLevels: Record<number, number>;
    coins: number;
    rewards: {
      openedChests: Record<number, boolean>;
      unlockedCards: string[];
      claimedBadges: string[];
    };
  }> {
    if (await this.isPostgresOnline()) {
      try {
        const levels = await db
          .select()
          .from(schema.userProgress)
          .where(eq(schema.userProgress.userId, userId));

        const [rewards] = await db
          .select()
          .from(schema.userRewards)
          .where(eq(schema.userRewards.userId, userId))
          .limit(1);

        const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

        const completedLevelsMap: Record<number, number> = {};
        levels.forEach((l: any) => {
          completedLevelsMap[l.level] = l.stars;
        });

        return {
          completedLevels: completedLevelsMap,
          coins: user?.coins || 0,
          rewards: rewards || { openedChests: {}, unlockedCards: [], claimedBadges: [] },
        };
      } catch (err) {
        console.warn('[Postgres GetProgress Failed, falling back to local store]:', err);
      }
    }

    const userLevels = memoryState.progress.filter((p) => p.userId === userId);
    const completedLevelsMap: Record<number, number> = {};
    userLevels.forEach((l) => {
      completedLevelsMap[l.level] = l.stars;
    });

    const userRewards = memoryState.rewards.find((r) => r.userId === userId);
    const user = memoryState.users.find((u) => u.id === userId);

    return {
      completedLevels: completedLevelsMap,
      coins: user?.coins || 0,
      rewards: userRewards || { openedChests: {}, unlockedCards: [], claimedBadges: [] },
    };
  },

  async saveLevelProgress(userId: number, username: string, level: number, stars: number, score: number) {
    if (await this.isPostgresOnline()) {
      try {
        const [existing] = await db
          .select()
          .from(schema.userProgress)
          .where(eq(schema.userProgress.userId, userId))
          .limit(1);

        if (!existing) {
          await db.insert(schema.userProgress).values({ userId, level, stars, score });
        } else if (stars > existing.stars) {
          await db
            .update(schema.userProgress)
            .set({ stars, score: Math.max(existing.score, score), completedAt: new Date() })
            .where(eq(schema.userProgress.id, existing.id));
        }

        await db.insert(schema.gameLogs).values({
          userId,
          username,
          level,
          stars,
          score,
          timeSpentSeconds: 0,
        });
        return;
      } catch (err) {
        console.warn('[Postgres SaveLevel Failed, falling back to local store]:', err);
      }
    }

    const existingIdx = memoryState.progress.findIndex((p) => p.userId === userId && p.level === level);
    if (existingIdx === -1) {
      memoryState.progress.push({
        id: memoryState.nextProgressId++,
        userId,
        level,
        stars,
        score,
        completedAt: new Date().toISOString(),
      });
    } else if (stars > memoryState.progress[existingIdx].stars) {
      memoryState.progress[existingIdx].stars = stars;
      memoryState.progress[existingIdx].score = Math.max(memoryState.progress[existingIdx].score, score);
      memoryState.progress[existingIdx].completedAt = new Date().toISOString();
    }

    memoryState.logs.push({
      id: memoryState.nextLogId++,
      userId,
      username,
      level,
      stars,
      score,
      timeSpentSeconds: 0,
      createdAt: new Date().toISOString(),
    });

    saveFallbackData();
  },

  async saveRewardData(
    userId: number,
    data: {
      coins?: number;
      openedChests?: Record<number, boolean>;
      unlockedCards?: string[];
      claimedBadges?: string[];
    }
  ) {
    if (await this.isPostgresOnline()) {
      try {
        if (typeof data.coins === 'number') {
          await db.update(schema.users).set({ coins: data.coins, updatedAt: new Date() }).where(eq(schema.users.id, userId));
        }
        const [existing] = await db.select().from(schema.userRewards).where(eq(schema.userRewards.userId, userId)).limit(1);
        if (existing) {
          await db
            .update(schema.userRewards)
            .set({
              openedChests: data.openedChests ?? existing.openedChests,
              unlockedCards: data.unlockedCards ?? existing.unlockedCards,
              claimedBadges: data.claimedBadges ?? existing.claimedBadges,
              updatedAt: new Date(),
            })
            .where(eq(schema.userRewards.id, existing.id));
        }
        return;
      } catch (err) {
        console.warn('[Postgres SaveReward Failed, falling back to local store]:', err);
      }
    }

    if (typeof data.coins === 'number') {
      const u = memoryState.users.find((u) => u.id === userId);
      if (u) u.coins = data.coins;
    }

    const rIdx = memoryState.rewards.findIndex((r) => r.userId === userId);
    if (rIdx !== -1) {
      if (data.openedChests) memoryState.rewards[rIdx].openedChests = data.openedChests;
      if (data.unlockedCards) memoryState.rewards[rIdx].unlockedCards = data.unlockedCards;
      if (data.claimedBadges) memoryState.rewards[rIdx].claimedBadges = data.claimedBadges;
      memoryState.rewards[rIdx].updatedAt = new Date().toISOString();
    } else {
      memoryState.rewards.push({
        id: memoryState.nextUserId++,
        userId,
        openedChests: data.openedChests || {},
        unlockedCards: data.unlockedCards || [],
        claimedBadges: data.claimedBadges || [],
        updatedAt: new Date().toISOString(),
      });
    }

    saveFallbackData();
  },

  async resetUserProgress(userId: number) {
    if (await this.isPostgresOnline()) {
      try {
        await db.delete(schema.userProgress).where(eq(schema.userProgress.userId, userId));
        await db.update(schema.userRewards).set({ openedChests: {}, unlockedCards: [], claimedBadges: [] }).where(eq(schema.userRewards.userId, userId));
        return;
      } catch (err) {
        console.warn('[Postgres Reset Failed, falling back to local store]:', err);
      }
    }

    memoryState.progress = memoryState.progress.filter((p) => p.userId !== userId);
    const rIdx = memoryState.rewards.findIndex((r) => r.userId === userId);
    if (rIdx !== -1) {
      memoryState.rewards[rIdx].openedChests = {};
      memoryState.rewards[rIdx].unlockedCards = [];
      memoryState.rewards[rIdx].claimedBadges = [];
    }
    saveFallbackData();
  },

  async getAllUsers(): Promise<UserWithStats[]> {
    if (await this.isPostgresOnline()) {
      try {
        const usersList = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
        const allProgress = await db.select().from(schema.userProgress);

        return usersList.map((u: any) => {
          const uProgress = allProgress.filter((p: any) => p.userId === u.id);
          const starsCount = uProgress.reduce((acc: number, p: any) => acc + p.stars, 0);
          const maxLevel = uProgress.reduce((max: number, p: any) => Math.max(max, p.level), 0);

          return {
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role as 'admin' | 'player',
            avatar: u.avatar,
            coins: u.coins,
            starsCount,
            maxLevel,
            levelsCompletedCount: uProgress.length,
            createdAt: u.createdAt.toISOString(),
          };
        });
      } catch (err) {
        console.warn('[Postgres GetAllUsers Failed, falling back to local store]:', err);
      }
    }

    return memoryState.users.map((u: UserRecord) => {
      const uProgress = memoryState.progress.filter((p) => p.userId === u.id);
      const starsCount = uProgress.reduce((acc, p) => acc + p.stars, 0);
      const maxLevel = uProgress.reduce((max, p) => Math.max(max, p.level), 0);

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        coins: u.coins,
        starsCount,
        maxLevel,
        levelsCompletedCount: uProgress.length,
        createdAt: u.createdAt,
      };
    });
  },

  async getAdminStats() {
    const users = await this.getAllUsers();
    let totalGamesPlayed = memoryState.logs.length;
    const totalStars = users.reduce((acc: number, u: UserWithStats) => acc + u.starsCount, 0);
    const totalCoins = users.reduce((acc: number, u: UserWithStats) => acc + u.coins, 0);
    let recentLogs = memoryState.logs.slice(-10).reverse();

    const levelCounts: Record<number, number> = {};
    memoryState.progress.forEach((p) => {
      levelCounts[p.level] = (levelCounts[p.level] || 0) + 1;
    });

    if (await this.isPostgresOnline()) {
      try {
        const [logCount] = await db.select({ count: count() }).from(schema.gameLogs);
        totalGamesPlayed = Number(logCount.count);
        const dbLogs = await db.select().from(schema.gameLogs).orderBy(desc(schema.gameLogs.createdAt)).limit(10);
        recentLogs = dbLogs.map((l: any) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        }));
      } catch {
        // ignore
      }
    }

    return {
      totalUsers: users.length,
      totalGamesPlayed,
      totalStars,
      totalCoins,
      levelDistribution: levelCounts,
      recentLogs,
    };
  },

  async updateUser(userId: number, update: { role?: 'admin' | 'player'; coins?: number; username?: string; avatar?: string }) {
    if (await this.isPostgresOnline()) {
      try {
        await db.update(schema.users).set({ ...update, updatedAt: new Date() }).where(eq(schema.users.id, userId));
        return;
      } catch (err) {
        console.warn('[Postgres UpdateUser Failed, falling back to local store]:', err);
      }
    }

    const u = memoryState.users.find((u) => u.id === userId);
    if (u) {
      if (update.role) u.role = update.role;
      if (typeof update.coins === 'number') u.coins = update.coins;
      if (update.username) u.username = update.username;
      if (update.avatar) u.avatar = update.avatar;
      u.updatedAt = new Date().toISOString();
      saveFallbackData();
    }
  },

  async deleteUser(userId: number) {
    if (await this.isPostgresOnline()) {
      try {
        await db.delete(schema.users).where(eq(schema.users.id, userId));
        return;
      } catch (err) {
        console.warn('[Postgres DeleteUser Failed, falling back to local store]:', err);
      }
    }

    memoryState.users = memoryState.users.filter((u) => u.id !== userId);
    memoryState.progress = memoryState.progress.filter((p) => p.userId !== userId);
    memoryState.rewards = memoryState.rewards.filter((r) => r.userId !== userId);
    saveFallbackData();
  },

  async getLeaderboard() {
    const users = await this.getAllUsers();
    return users
      .map((u: UserWithStats) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        role: u.role,
        totalStars: u.starsCount,
        totalScore: u.starsCount * 100,
        levelsCleared: u.levelsCompletedCount,
        coins: u.coins,
      }))
      .sort((a: any, b: any) => (b.totalStars !== a.totalStars ? b.totalStars - a.totalStars : b.coins - a.coins))
      .slice(0, 50);
  },
};
