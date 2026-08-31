import { useState, useEffect, useCallback } from 'react';
import { GameScreen as GameScreenType, UserProfile } from './types';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameScreen } from './components/GameScreen';
import { RewardModal } from './components/RewardModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { resetRewardData, getRewardData, saveRewardData } from './utils/rewardStorage';
import { api } from './utils/api';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('main_menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);

  // User Auth & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

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

  // Sync Progress with server
  const syncWithServer = useCallback(async () => {
    try {
      const progress = await api.getProgress();
      if (progress) {
        if (progress.completedLevels && Object.keys(progress.completedLevels).length > 0) {
          setCompletedLevels((prev) => {
            const merged = { ...prev, ...progress.completedLevels };
            try {
              localStorage.setItem('funiko_completed_levels', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
        if (progress.rewards) {
          const localRewards = getRewardData();
          saveRewardData({
            ...localRewards,
            coins: progress.coins ?? localRewards.coins,
            openedChests: { ...localRewards.openedChests, ...progress.rewards.openedChests },
            unlockedCards: Array.from(new Set([...localRewards.unlockedCards, ...(progress.rewards.unlockedCards || [])])),
            claimedBadges: Array.from(new Set([...localRewards.claimedBadges, ...(progress.rewards.claimedBadges || [])])),
          });
        }
      }
    } catch (err) {
      console.warn('Sync with server skipped:', err);
    }
  }, []);

  // Check current session on startup
  useEffect(() => {
    api.getMe().then((user) => {
      if (user) {
        setCurrentUser(user);
        syncWithServer();
      }
    });
  }, [syncWithServer]);

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
        // Save to backend if user is logged in
        if (currentUser) {
          api.saveLevelProgress(level, stars, stars * 100);
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
    if (currentUser) {
      api.resetUserProgress();
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    syncWithServer();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    if (currentScreen === 'admin_dashboard') {
      setCurrentScreen('main_menu');
    }
  };

  const handleOpenRewards = (levelToOpen?: number) => {
    setAutoOpenChestLevel(levelToOpen);
    setShowRewardsModal(true);
  };

  const handleStartQuickPlay = () => {
    if (!currentUser) {
      setAuthModalMessage('Silakan masuk akun terlebih dahulu untuk memulai permainan!');
      setAuthInitialTab('login');
      setShowAuthModal(true);
      return;
    }
    setCurrentLevel(1);
    setIsRandomMode(false);
    setCurrentScreen('game');
  };

  const handleSelectLevel = (levelNumber: number, randomMode: boolean = false) => {
    if (!currentUser) {
      setAuthModalMessage('Silakan masuk akun terlebih dahulu untuk memilih level petualangan!');
      setAuthInitialTab('login');
      setShowAuthModal(true);
      return;
    }

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
          onOpenLevelSelect={() => {
            if (!currentUser) {
              setAuthModalMessage('Silakan masuk akun terlebih dahulu untuk memulai petualangan!');
              setAuthInitialTab('login');
              setShowAuthModal(true);
              return;
            }
            setCurrentScreen('level_select');
          }}
          onResetProgress={handleResetProgress}
          onOpenRewards={() => handleOpenRewards()}
          onOpenProfile={() => setShowProfileModal(true)}
          completedLevels={completedLevels}
          currentUser={currentUser}
          onOpenAuth={(tab, message) => {
            setAuthInitialTab(tab || 'login');
            setAuthModalMessage(message);
            setShowAuthModal(true);
          }}
          onLogout={handleLogout}
          onOpenAdmin={() => setCurrentScreen('admin_dashboard')}
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

      {/* Admin Dashboard Screen */}
      {currentScreen === 'admin_dashboard' && currentUser?.role === 'admin' && (
        <AdminDashboard
          currentUser={currentUser}
          onBackToGame={() => setCurrentScreen('main_menu')}
          onRefreshUserData={syncWithServer}
        />
      )}

      {/* Global Reward System Modal */}
      {showRewardsModal && (
        <RewardModal
          completedLevels={completedLevels}
          onClose={() => {
            setShowRewardsModal(false);
            setAutoOpenChestLevel(undefined);
            if (currentUser) {
              api.saveRewardData(getRewardData());
            }
          }}
          autoOpenLevelChest={autoOpenChestLevel}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          completedLevels={completedLevels}
          rewards={getRewardData()}
          onClose={() => setShowProfileModal(false)}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
          onLogout={handleLogout}
          onOpenAuth={(tab) => {
            setAuthInitialTab(tab);
            setAuthModalMessage(undefined);
            setShowAuthModal(true);
          }}
          onOpenAdmin={() => {
            setShowProfileModal(false);
            setCurrentScreen('admin_dashboard');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialTab={authInitialTab}
        message={authModalMessage}
        onClose={() => {
          setShowAuthModal(false);
          setAuthModalMessage(undefined);
        }}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}

export default App;
