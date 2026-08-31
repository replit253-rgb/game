export interface Animal {
  id: string;
  name: string;
  image: string;
  category?: string;
  habitat?: string;
  food?: string;
  funFact?: string;
  englishName?: string;
  rarity?: 'Silver' | 'Gold' | 'Diamond';
}

export type GameScreen = 'main_menu' | 'level_select' | 'game' | 'animal_encyclopedia' | 'admin_dashboard';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'player';
  avatar: string;
  coins: number;
  createdAt?: string;
}

export interface AdminUserItem {
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

export interface AdminStats {
  totalUsers: number;
  totalGamesPlayed: number;
  totalStars: number;
  totalCoins: number;
  levelDistribution: Record<number, number>;
  recentLogs: Array<{
    id: number;
    username: string;
    level: number;
    stars: number;
    score: number;
    createdAt: string;
  }>;
}

export interface LeaderboardPlayer {
  id: number;
  username: string;
  avatar: string;
  role: string;
  totalStars: number;
  totalScore: number;
  levelsCleared: number;
  coins: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  animalCount: number;
  fixedAnimals?: string[]; // IDs for preset levels if any
}

export interface DragItem {
  id: string;
  name: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  coinReward: number;
  maxProgress: number;
}

export interface RangerRank {
  level: number;
  title: string;
  description: string;
  minStars: number;
  minCards: number;
  icon: string;
  badgeColor: string;
}

export interface RewardData {
  coins: number;
  openedChests: Record<number, boolean>;
  unlockedCards: string[];
  claimedBadges: string[];
}

export interface ChestRewardResult {
  level: number;
  coins: number;
  card: Animal;
  badge?: AchievementBadge;
}

