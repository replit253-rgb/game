import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  CheckCircle,
  Lock,
  Volume2,
} from 'lucide-react';
import { Animal, ChestRewardResult, RangerRank, LevelConfig } from '../types';
import { ENRICHED_ANIMALS, RANGER_RANKS } from '../data/rewardsData';
import { PRESET_LEVELS } from '../data/animals';
import {
  getRewardData,
  getBadgesState,
  getCurrentRangerRank,
  openLevelChest,
  claimBadge,
} from '../utils/rewardStorage';
import { soundFx } from '../utils/audio';
import { ChestOpenModal } from './ChestOpenModal';

interface RewardModalProps {
  onClose: () => void;
  completedLevels: Record<number, number>;
  initialTab?: 'chests' | 'badges' | 'cards' | 'rank';
  autoOpenLevelChest?: number; // Optional level chest to open immediately
}

export const RewardModal: React.FC<RewardModalProps> = ({
  onClose,
  completedLevels,
  initialTab = 'chests',
  autoOpenLevelChest,
}) => {
  const [activeTab, setActiveTab] = useState<'chests' | 'badges' | 'cards' | 'rank'>(
    initialTab
  );

  // Filter state for collectible cards
  const [cardFilter, setCardFilter] = useState<'All' | 'Silver' | 'Gold' | 'Diamond'>('All');
  const [selectedCardDetail, setSelectedCardDetail] = useState<Animal | null>(null);

  // Reward Data & Chest Opening
  const [rewardData, setRewardData] = useState(getRewardData());
  const [chestRewardResult, setChestRewardResult] = useState<ChestRewardResult | null>(null);

  useEffect(() => {
    // Refresh state
    setRewardData(getRewardData());

    // Auto open chest if requested (e.g. directly from Victory Modal)
    if (autoOpenLevelChest) {
      handleOpenChest(autoOpenLevelChest);
    }
  }, [autoOpenLevelChest]);

  const refreshRewardData = () => {
    setRewardData(getRewardData());
  };

  const handleTabChange = (tab: 'chests' | 'badges' | 'cards' | 'rank') => {
    soundFx.play('click');
    setActiveTab(tab);
  };

  const handleOpenChest = (level: number) => {
    soundFx.play('click');
    const result = openLevelChest(level);
    if (result) {
      setChestRewardResult(result);
      refreshRewardData();
    }
  };

  const handleClaimBadge = (badgeId: string) => {
    soundFx.play('click');
    const rewardCoins = claimBadge(badgeId);
    if (rewardCoins) {
      refreshRewardData();
    }
  };

  const handleSpeakAnimalName = (animalName: string) => {
    soundFx.speakText(animalName);
  };

  // Calculations
  const badges = getBadgesState(completedLevels);
  const claimableBadgesCount = badges.filter(b => b.isUnlocked && !b.isClaimed).length;
  const rangerRankInfo = getCurrentRangerRank(
    completedLevels,
    rewardData.unlockedCards.length
  );

  // Cards filtered list
  const filteredCards = ENRICHED_ANIMALS.filter(card => {
    if (cardFilter === 'All') return true;
    return card.rarity === cardFilter;
  });

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Diamond':
        return 'border-cyan-400 bg-cyan-950/40 text-cyan-300';
      case 'Gold':
        return 'border-amber-400 bg-amber-950/40 text-amber-300';
      default:
        return 'border-slate-400 bg-slate-900/40 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-1.5 xs:p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-amber-950 border-4 border-amber-600 rounded-3xl p-2.5 xs:p-4 sm:p-6 shadow-2xl flex flex-col h-[92vh] max-h-[680px] my-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-amber-800/80 gap-1.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="min-w-0">
              <h2
                className="text-amber-200 text-sm xs:text-lg sm:text-2xl font-black tracking-widest truncate"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '0.1em' }}
              >
                REWARD & KOLEKSI
              </h2>
              <p className="text-amber-400/90 text-[10px] xs:text-xs sm:text-sm font-semibold hidden xs:block truncate">
                Kumpulkan Koin, Lencana, dan Kartu Satwa!
              </p>
            </div>
          </div>

          {/* Right Header Controls: Coins & Close */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Coin Badge */}
            <div className="flex items-center gap-1 bg-amber-900/90 border-2 border-amber-500 px-2 xs:px-3 py-1 rounded-xl xs:rounded-2xl shadow-inner">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-300 text-xs xs:text-sm sm:text-base font-extrabold">
                {rewardData.coins}
              </span>
            </div>

            {/* Close Button */}
            <button
              id="reward-close-btn"
              onClick={onClose}
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-900 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center justify-center transition-transform active:scale-90 min-w-[36px] min-h-[36px]"
              title="Tutup Menu"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 my-2 sm:my-3">
          {/* Tab 1: Peti Hadiah */}
          <button
            id="tab-chests-btn"
            onClick={() => handleTabChange('chests')}
            className={`flex items-center justify-center py-1.5 px-1 sm:py-2 sm:px-2 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-[10px] xs:text-xs sm:text-sm min-h-[38px] sm:min-h-[44px] ${
              activeTab === 'chests'
                ? 'bg-amber-800 border-amber-400 text-amber-100 shadow-lg'
                : 'bg-amber-950/80 border-amber-900 text-amber-300/80 hover:bg-amber-900/50'
            }`}
          >
            <span className="truncate">Peti</span>
          </button>

          {/* Tab 2: Lencana Prestasi */}
          <button
            id="tab-badges-btn"
            onClick={() => handleTabChange('badges')}
            className={`relative flex items-center justify-center py-1.5 px-1 sm:py-2 sm:px-2 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-[10px] xs:text-xs sm:text-sm min-h-[38px] sm:min-h-[44px] ${
              activeTab === 'badges'
                ? 'bg-amber-800 border-amber-400 text-amber-100 shadow-lg'
                : 'bg-amber-950/80 border-amber-900 text-amber-300/80 hover:bg-amber-900/50'
            }`}
          >
            <span className="truncate">Lencana</span>
            {claimableBadgesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold animate-bounce shadow">
                {claimableBadgesCount}
              </span>
            )}
          </button>

          {/* Tab 3: Kartu Koleksi */}
          <button
            id="tab-cards-btn"
            onClick={() => handleTabChange('cards')}
            className={`flex items-center justify-center py-1.5 px-1 sm:py-2 sm:px-2 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-[10px] xs:text-xs sm:text-sm min-h-[38px] sm:min-h-[44px] ${
              activeTab === 'cards'
                ? 'bg-amber-800 border-amber-400 text-amber-100 shadow-lg'
                : 'bg-amber-950/80 border-amber-900 text-amber-300/80 hover:bg-amber-900/50'
            }`}
          >
            <span className="truncate">Kartu</span>
          </button>

          {/* Tab 4: Pangkat Ranger */}
          <button
            id="tab-rank-btn"
            onClick={() => handleTabChange('rank')}
            className={`flex items-center justify-center py-1.5 px-1 sm:py-2 sm:px-2 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-[10px] xs:text-xs sm:text-sm min-h-[38px] sm:min-h-[44px] ${
              activeTab === 'rank'
                ? 'bg-amber-800 border-amber-400 text-amber-100 shadow-lg'
                : 'bg-amber-950/80 border-amber-900 text-amber-300/80 hover:bg-amber-900/50'
            }`}
          >
            <span className="truncate">Pangkat</span>
          </button>
        </div>

        {/* Tab Content Body Area */}
        <div className="flex-1 overflow-y-auto pr-1 my-1">
          {/* TAB 1: PETI HADIAH MISTERI */}
          {activeTab === 'chests' && (
            <div className="flex flex-col gap-3 p-1">
              <div className="bg-amber-900/50 border border-amber-700/80 rounded-2xl p-3 text-center mb-1">
                <p className="text-amber-200 text-xs sm:text-sm font-semibold">
                  Selesaikan tiap level tebak hewan untuk membuka **Peti Hadiah Misteri** berisi
                  Koin Bonus & Kartu Satwa Langka!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_LEVELS.map((lvl: LevelConfig) => {
                  const isLevelCompleted = !!completedLevels[lvl.level];
                  const isOpened = !!rewardData.openedChests[lvl.level];

                  return (
                    <div
                      key={lvl.level}
                      className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                        isOpened
                          ? 'bg-amber-900/30 border-amber-800/60'
                          : isLevelCompleted
                          ? 'bg-amber-900/90 border-yellow-400 shadow-lg ring-2 ring-yellow-400/50 animate-pulse'
                          : 'bg-amber-950/60 border-amber-900/80 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-xs sm:text-sm border shadow-inner ${
                            isOpened
                              ? 'bg-amber-950/80 text-amber-500/80 border-amber-800'
                              : isLevelCompleted
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400'
                              : 'bg-stone-900/80 text-stone-500 border-stone-800'
                          }`}
                        >
                          <span>LVL</span>
                          <span className="text-sm sm:text-base leading-none">{lvl.level}</span>
                        </div>

                        <div>
                          <h4 className="text-amber-100 font-extrabold text-sm sm:text-base">
                            Peti Hadiah Level {lvl.level}
                          </h4>
                          <span className="text-amber-300/80 text-xs font-semibold block">
                            {isOpened
                              ? 'Sudah Dibuka'
                              : isLevelCompleted
                              ? 'Siap Dibuka!'
                              : `Selesaikan Level ${lvl.level}`}
                          </span>
                        </div>
                      </div>

                      {/* Action button */}
                      <div>
                        {isOpened ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-600 px-2.5 py-1 rounded-xl">
                            <CheckCircle className="w-4 h-4" />
                            <span>Klaim</span>
                          </div>
                        ) : isLevelCompleted ? (
                          <button
                            id={`open-chest-lvl-${lvl.level}-btn`}
                            onClick={() => handleOpenChest(lvl.level)}
                            className="relative h-[42px] px-4 flex items-center justify-center transition-transform active:scale-95 hover:scale-105 touch-manipulation min-h-[44px]"
                          >
                            <img
                              src="/assets/Btn_.png"
                              alt="Buka Peti"
                              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-md"
                            />
                            <span
                              className="relative z-10 text-white text-xs font-extrabold tracking-wider flex items-center gap-1"
                              style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                WebkitTextStroke: '1px #451a03',
                              }}
                            >
                              BUKA PETI
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-400/60 font-semibold text-xs bg-amber-950/80 border border-amber-900 px-2.5 py-1 rounded-xl">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Terkunci</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LENCANA PRESTASI */}
          {activeTab === 'badges' && (
            <div className="flex flex-col gap-3 p-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all ${
                      badge.isClaimed
                        ? 'bg-amber-900/30 border-amber-800/60 opacity-80'
                        : badge.isUnlocked
                        ? 'bg-amber-900/90 border-yellow-400 shadow-xl'
                        : 'bg-amber-950/70 border-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-900 border border-amber-600 flex items-center justify-center text-2xl shadow">
                        {badge.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-amber-100 font-extrabold text-sm sm:text-base">
                            {badge.title}
                          </h4>
                          <span className="text-yellow-300 font-bold text-xs flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-yellow-400" />+{badge.coinReward}
                          </span>
                        </div>
                        <p className="text-amber-200/90 text-xs mt-0.5">{badge.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar & Claim Button */}
                    <div className="mt-3 pt-2 border-t border-amber-800/60 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] font-bold text-amber-300/80 mb-1">
                          <span>Kemajuan:</span>
                          <span>
                            {badge.progress} / {badge.maxProgress}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-amber-950 rounded-full overflow-hidden border border-amber-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((badge.progress / badge.maxProgress) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {badge.isClaimed ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Diklaim
                        </span>
                      ) : badge.isUnlocked ? (
                        <button
                          id={`claim-badge-${badge.id}-btn`}
                          onClick={() => handleClaimBadge(badge.id)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl border border-yellow-300 shadow active:scale-95 transition-transform min-h-[36px]"
                        >
                          Klaim!
                        </button>
                      ) : (
                        <span className="text-amber-400/60 text-xs font-semibold">Belum Buka</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KARTU KOLEKSI SATWA */}
          {activeTab === 'cards' && (
            <div className="flex flex-col gap-3 p-1">
              {/* Rarity Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', 'Silver', 'Gold', 'Diamond'] as const).map(filterOption => (
                  <button
                    key={filterOption}
                    onClick={() => setCardFilter(filterOption)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                      cardFilter === filterOption
                        ? 'bg-amber-800 border-amber-400 text-amber-100 shadow'
                        : 'bg-amber-950/80 border-amber-900 text-amber-400/70 hover:bg-amber-900/50'
                    }`}
                  >
                    {filterOption === 'All' ? 'Semua Kartu' : filterOption}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredCards.map(card => {
                  const isUnlocked = rewardData.unlockedCards.includes(card.id);
                  const rarityStyle = getRarityColor(card.rarity);

                  return (
                    <div
                      key={card.id}
                      onClick={() => isUnlocked && setSelectedCardDetail(card)}
                      className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all ${
                        isUnlocked
                          ? `${rarityStyle} cursor-pointer hover:scale-105 active:scale-95 shadow-md`
                          : 'bg-amber-950/70 border-amber-900/80 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Rarity Label Badge */}
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-black/40 border border-white/20">
                        {card.rarity}
                      </span>

                      {/* Card Animal Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center my-1">
                        {isUnlocked ? (
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-full object-contain filter drop-shadow-md"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-amber-600/70">
                            <Lock className="w-8 h-8 mb-1" />
                            <span className="text-[10px] text-center">Terkunci</span>
                          </div>
                        )}
                      </div>

                      {/* Name Label */}
                      <div className="text-center w-full mt-1">
                        <span className="text-amber-100 font-extrabold text-xs block truncate">
                          {isUnlocked ? card.name : '???'}
                        </span>
                        {isUnlocked && card.englishName && (
                          <span className="text-amber-300/80 text-[10px] italic block">
                            ({card.englishName})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Detail Modal */}
              {selectedCardDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
                  <div className="relative w-full max-w-sm bg-amber-950 border-4 border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
                    <button
                      onClick={() => setSelectedCardDetail(null)}
                      className="absolute top-3 right-3 p-1 rounded-xl bg-amber-900 text-amber-200 hover:bg-amber-800 border border-amber-600"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="w-28 h-28 relative my-2">
                      <img
                        src={selectedCardDetail.image}
                        alt={selectedCardDetail.name}
                        className="w-full h-full object-contain filter drop-shadow-xl"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-amber-100 text-xl font-extrabold">
                        {selectedCardDetail.name}
                      </h3>
                      <button
                        onClick={() => handleSpeakAnimalName(selectedCardDetail.name)}
                        className="p-1 rounded-full bg-amber-800 text-amber-200 hover:bg-amber-700"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-amber-300 text-xs italic font-semibold mb-3">
                      ({selectedCardDetail.englishName})
                    </p>

                    <div className="w-full bg-amber-900/60 rounded-xl p-3 text-xs text-amber-200/90 flex flex-col gap-1 border border-amber-800">
                      <div>
                        <strong>Habitat:</strong> {selectedCardDetail.habitat}
                      </div>
                      <div>
                        <strong>Makanan:</strong> {selectedCardDetail.food}
                      </div>
                      <div className="mt-1 pt-1 border-t border-amber-800/80 italic">
                        &quot;{selectedCardDetail.funFact}&quot;
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PANGKAT RANGER */}
          {activeTab === 'rank' && (
            <div className="flex flex-col gap-4 p-1">
              {/* Current Rank Showcase Card */}
              <div
                className={`p-4 rounded-3xl bg-gradient-to-r ${rangerRankInfo.currentRank.badgeColor} border-2 border-yellow-400/80 shadow-xl flex items-center justify-between gap-3 text-white`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-black/30 border border-white/30 flex items-center justify-center text-4xl shadow-inner">
                    {rangerRankInfo.currentRank.icon}
                  </div>

                  <div>
                    <span className="text-yellow-300 text-xs font-bold uppercase tracking-wider block">
                      Gelar Ranger Kamu Saat Ini:
                    </span>
                    <h3
                      className="text-white text-xl sm:text-2xl font-black"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {rangerRankInfo.currentRank.title}
                    </h3>
                    <p className="text-amber-100/90 text-xs mt-0.5">
                      {rangerRankInfo.currentRank.description}
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-yellow-200 block">Total Bintang:</span>
                  <span className="text-2xl font-black text-yellow-300">
                    ⭐ {rangerRankInfo.totalStars}
                  </span>
                </div>
              </div>

              {/* Progress to Next Rank */}
              {rangerRankInfo.nextRank && (
                <div className="bg-amber-900/60 border border-amber-800 rounded-2xl p-3">
                  <div className="flex justify-between text-xs font-bold text-amber-200 mb-1.5">
                    <span>Kemajuan Menuju Gelar Berikutnya:</span>
                    <span className="text-yellow-300 font-extrabold">
                      {rangerRankInfo.nextRank.title} ({rangerRankInfo.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-amber-950 rounded-full overflow-hidden border border-amber-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300"
                      style={{ width: `${rangerRankInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rank Roadmap List */}
              <div className="flex flex-col gap-2">
                <h4 className="text-amber-200 font-bold text-sm">Roadmap Pangkat Ranger:</h4>

                {RANGER_RANKS.map((rank: RangerRank) => {
                  const isAchieved =
                    rangerRankInfo.totalStars >= rank.minStars &&
                    rewardData.unlockedCards.length >= rank.minCards;

                  return (
                    <div
                      key={rank.level}
                      className={`flex items-center justify-between p-3 rounded-2xl border ${
                        isAchieved
                          ? 'bg-amber-900/80 border-amber-500 text-amber-100'
                          : 'bg-amber-950/60 border-amber-900 text-amber-400/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{rank.icon}</span>
                        <div>
                          <h5 className="font-extrabold text-sm">{rank.title}</h5>
                          <span className="text-xs opacity-80">{rank.description}</span>
                        </div>
                      </div>

                      <div className="text-right text-xs font-bold">
                        {isAchieved ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Achieved
                          </span>
                        ) : (
                          <span className="text-amber-400/70">
                            Syarat: {rank.minStars} ⭐, {rank.minCards} 🎴
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chest Open Result Modal Popup */}
      {chestRewardResult && (
        <ChestOpenModal
          reward={chestRewardResult}
          onClose={() => setChestRewardResult(null)}
        />
      )}
    </div>
  );
};
