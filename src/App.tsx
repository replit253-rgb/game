import { useState, useEffect } from 'react';
import { GameScreen as GameScreenType } from './types';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameScreen } from './components/GameScreen';
import { RewardModal } from './components/RewardModal';
import { resetRewardData } from './utils/rewardStorage';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('main_menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);

  // Reward Modal States
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [autoOpenChestLevel, setAutoOpenChestLevel] = useState<number | undefined>(undefined);

  const [completedLevels, setCompletedLevels] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('funiko_completed_levels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSaveLevelCompletion = (level: number, stars: number) => {
    setCompletedLevels((prev) => {
      const existing = prev[level] || 0;
      if (stars > existing) {
        const updated = { ...prev, [level]: stars };
        try {
          localStorage.setItem('funiko_completed_levels', JSON.stringify(updated));
        } catch {
          // localStorage error ignore
        }
        return updated;
      }
      return prev;
    });
  };

  const handleResetProgress = () => {
    setCompletedLevels({});
    resetRewardData();
    try {
      localStorage.removeItem('funiko_completed_levels');
    } catch {
      // ignore
    }
  };

  const handleOpenRewards = (levelToOpen?: number) => {
    setAutoOpenChestLevel(levelToOpen);
    setShowRewardsModal(true);
  };

  const handleStartQuickPlay = () => {
    setCurrentLevel(1);
    setIsRandomMode(false);
    setCurrentScreen('game');
  };

  const handleSelectLevel = (levelNumber: number, randomMode: boolean = false) => {
    if (randomMode) {
      setCurrentLevel(1);
      setIsRandomMode(true);
      setCurrentScreen('game');
      return;
    }

    const isUnlocked = levelNumber === 1 || Boolean(completedLevels[levelNumber - 1]);
    if (isUnlocked) {
      setCurrentLevel(levelNumber);
      setIsRandomMode(false);
      setCurrentScreen('game');
    }
  };

  // Support hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#level=')) {
        const levelNum = parseInt(hash.replace('#level=', ''), 10);
        if (!isNaN(levelNum)) {
          const isUnlocked = levelNum === 1 || Boolean(completedLevels[levelNum - 1]);
          if (isUnlocked) {
            setCurrentLevel(levelNum);
            setIsRandomMode(false);
            setCurrentScreen('game');
          }
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [completedLevels]);

  return (
    <main className="w-screen h-screen h-dvh overflow-hidden bg-amber-950 select-none">
      {currentScreen === 'main_menu' && (
        <MainMenu
          onStartGame={handleStartQuickPlay}
          onOpenLevelSelect={() => setCurrentScreen('level_select')}
          onResetProgress={handleResetProgress}
          onOpenRewards={() => handleOpenRewards()}
          completedLevels={completedLevels}
        />
      )}

      {currentScreen === 'level_select' && (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          onBackToMenu={() => setCurrentScreen('main_menu')}
          completedLevels={completedLevels}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          levelNumber={currentLevel}
          isRandomMode={isRandomMode}
          onGoToLevelSelect={() => setCurrentScreen('level_select')}
          onGoToMainMenu={() => setCurrentScreen('main_menu')}
          onSaveLevelCompletion={handleSaveLevelCompletion}
          onOpenRewards={(lvl) => handleOpenRewards(lvl)}
        />
      )}

      {/* Global Reward System Modal */}
      {showRewardsModal && (
        <RewardModal
          completedLevels={completedLevels}
          onClose={() => {
            setShowRewardsModal(false);
            setAutoOpenChestLevel(undefined);
          }}
          autoOpenLevelChest={autoOpenChestLevel}
        />
      )}
    </main>
  );
}

export default App;

