import { RewardData, ChestRewardResult, Animal, RangerRank } from '../types';
import { ENRICHED_ANIMALS, ACHIEVEMENTS, RANGER_RANKS } from '../data/rewardsData';
import { soundFx } from './audio';

const REWARD_STORAGE_KEY = 'funiko_reward_data';

export const getDefaultRewardData = (): RewardData => ({
  coins: 100, // starting coins welcome bonus
  openedChests: {},
  unlockedCards: ['kuda', 'beruang'], // Starter unlocked cards
  claimedBadges: [],
});

export const getRewardData = (): RewardData => {
  if (typeof window === 'undefined') return getDefaultRewardData();
  try {
    const raw = localStorage.getItem(REWARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        coins: typeof parsed.coins === 'number' ? parsed.coins : 100,
        openedChests: parsed.openedChests || {},
        unlockedCards: Array.isArray(parsed.unlockedCards) ? parsed.unlockedCards : ['kuda', 'beruang'],
        claimedBadges: Array.isArray(parsed.claimedBadges) ? parsed.claimedBadges : [],
      };
    }
  } catch {
    // ignore parsing errors
  }
  return getDefaultRewardData();
};

export const saveRewardData = (data: RewardData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

// Check if a level mystery chest is opened
export const isChestOpened = (level: number): boolean => {
  const data = getRewardData();
  return !!data.openedChests[level];
};

// Open level mystery chest
export const openLevelChest = (level: number): ChestRewardResult | null => {
  const data = getRewardData();
  if (data.openedChests[level]) {
    return null; // Already opened
  }

  // Determine coins reward for opening level chest
  const baseCoins = 100 + level * 50;

  // Find cards not yet unlocked
  const lockedCards = ENRICHED_ANIMALS.filter(a => !data.unlockedCards.includes(a.id));
  
  // Pick one random card to reward, or fallback if all unlocked
  let cardRewarded: Animal;
  if (lockedCards.length > 0) {
    cardRewarded = lockedCards[Math.floor(Math.random() * lockedCards.length)];
  } else {
    // Fallback if all unlocked
    cardRewarded = ENRICHED_ANIMALS[Math.floor(Math.random() * ENRICHED_ANIMALS.length)];
  }

  // Update storage
  const updatedUnlockedCards = Array.from(new Set([...data.unlockedCards, cardRewarded.id]));
  const newRewardData: RewardData = {
    ...data,
    coins: data.coins + baseCoins,
    openedChests: {
      ...data.openedChests,
      [level]: true,
    },
    unlockedCards: updatedUnlockedCards,
  };

  saveRewardData(newRewardData);
  soundFx.play('win_coin');

  return {
    level,
    coins: baseCoins,
    card: cardRewarded,
  };
};

// Claim an achievement badge
export const claimBadge = (badgeId: string): number | null => {
  const data = getRewardData();
  if (data.claimedBadges.includes(badgeId)) return null;

  const badgeDef = ACHIEVEMENTS.find(b => b.id === badgeId);
  if (!badgeDef) return null;

  const newRewardData: RewardData = {
    ...data,
    coins: data.coins + badgeDef.coinReward,
    claimedBadges: [...data.claimedBadges, badgeId],
  };

  saveRewardData(newRewardData);
  soundFx.play('win_coin');

  return badgeDef.coinReward;
};

// Calculate badges state with current progress
export const getBadgesState = (completedLevels: Record<number, number>) => {
  const data = getRewardData();
  const totalWins = Object.keys(completedLevels).length;
  const has3StarWin = Object.values(completedLevels).some(stars => stars >= 3);
  const totalCardsUnlocked = data.unlockedCards.length;
  const currentCoins = data.coins;

  return ACHIEVEMENTS.map(badge => {
    let progress = 0;
    let isUnlocked = false;

    if (badge.id === 'first_win') {
      progress = Math.min(1, totalWins);
      isUnlocked = totalWins >= 1;
    } else if (badge.id === 'star_ranger') {
      progress = has3StarWin ? 1 : 0;
      isUnlocked = has3StarWin;
    } else if (badge.id === 'master_rimba') {
      progress = Math.min(5, totalWins);
      isUnlocked = totalWins >= 5;
    } else if (badge.id === 'coin_collector') {
      progress = Math.min(300, currentCoins);
      isUnlocked = currentCoins >= 300;
    } else if (badge.id === 'animal_friend') {
      progress = Math.min(5, totalCardsUnlocked);
      isUnlocked = totalCardsUnlocked >= 5;
    } else if (badge.id === 'legendary_ranger') {
      progress = Math.min(12, totalCardsUnlocked);
      isUnlocked = totalCardsUnlocked >= 12;
    }

    const isClaimed = data.claimedBadges.includes(badge.id);

    return {
      ...badge,
      progress,
      isUnlocked,
      isClaimed,
    };
  });
};

// Calculate Ranger Rank based on stars and unlocked cards
export const getCurrentRangerRank = (completedLevels: Record<number, number>, unlockedCardsCount: number) => {
  const totalStars = Object.values(completedLevels).reduce((a, b) => a + b, 0);

  let currentRank: RangerRank = RANGER_RANKS[0];
  let nextRank: RangerRank | null = RANGER_RANKS[1];

  for (let i = RANGER_RANKS.length - 1; i >= 0; i--) {
    const rank = RANGER_RANKS[i];
    if (totalStars >= rank.minStars && unlockedCardsCount >= rank.minCards) {
      currentRank = rank;
      nextRank = RANGER_RANKS[i + 1] || null;
      break;
    }
  }

  let progressPercent = 100;
  if (nextRank) {
    const starsNeeded = nextRank.minStars - currentRank.minStars;
    const currentStarProgress = Math.max(0, totalStars - currentRank.minStars);
    progressPercent = Math.min(100, Math.round((currentStarProgress / Math.max(1, starsNeeded)) * 100));
  }

  return {
    currentRank,
    nextRank,
    totalStars,
    progressPercent,
  };
};

export const resetRewardData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REWARD_STORAGE_KEY);
  }
};
