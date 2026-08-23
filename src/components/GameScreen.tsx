import React, { useState, useEffect, useCallback } from 'react';
import { Animal } from '../types';
import { ALL_ANIMALS, PRESET_LEVELS } from '../data/animals';
import { soundFx } from '../utils/audio';
import { AnimalCard } from './AnimalCard';
import { NamePlate } from './NamePlate';
import { GameOverModal } from './GameOverModal';
import { VictoryModal } from './VictoryModal';
import { PauseModal } from './PauseModal';
import { Volume2, VolumeX } from 'lucide-react';

interface GameScreenProps {
  levelNumber: number;
  isRandomMode: boolean;
  onGoToLevelSelect: () => void;
  onGoToMainMenu: () => void;
  onSaveLevelCompletion: (level: number, stars: number) => void;
  onOpenRewards?: (level: number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelNumber,
  isRandomMode,
  onGoToLevelSelect,
  onGoToMainMenu,
  onSaveLevelCompletion,
  onOpenRewards,
}) => {
  const [levelAnimals, setLevelAnimals] = useState<Animal[]>([]);
  const [shuffledNames, setShuffledNames] = useState<Animal[]>([]);
  const [matchedAnimalIds, setMatchedAnimalIds] = useState<Set<string>>(new Set());
  const [selectedName, setSelectedName] = useState<{ id: string; name: string } | null>(null);

  // Health and game states
  const [hearts, setHearts] = useState<number>(3);
  const [wrongShakeAnimalId, setWrongShakeAnimalId] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());

  // Setup level
  const setupLevel = useCallback(() => {
    let chosenAnimals: Animal[] = [];

    if (isRandomMode) {
      // Pick 4-6 random animals
      const shuffledAll = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
      chosenAnimals = shuffledAll.slice(0, 4);
    } else {
      const config = PRESET_LEVELS.find((l) => l.level === levelNumber);
      if (config) {
        if (config.presetIds && config.presetIds.length > 0) {
          chosenAnimals = config.presetIds
            .map((id) => ALL_ANIMALS.find((a) => a.id === id))
            .filter((a): a is Animal => !!a);
        } else {
          const shuffledAll = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
          chosenAnimals = shuffledAll.slice(0, config.animalCount);
        }
      } else {
        const shuffledAll = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
        chosenAnimals = shuffledAll.slice(0, 4);
      }
    }

    setLevelAnimals(chosenAnimals);
    // Shuffle the bottom name boards randomly
    const namesShuffled = [...chosenAnimals].sort(() => Math.random() - 0.5);
    setShuffledNames(namesShuffled);

    setMatchedAnimalIds(new Set());
    setSelectedName(null);
    setHearts(3);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
  }, [levelNumber, isRandomMode]);

  useEffect(() => {
    setupLevel();
  }, [setupLevel]);

  // Handle matching logic
  const handleDropName = (targetAnimalId: string, droppedNameId: string) => {
    if (isGameOver || isVictory || isPaused) return;

    if (targetAnimalId === droppedNameId) {
      // CORRECT MATCH!
      soundFx.play('correct');
      soundFx.play('guess_correct');

      const targetAnimal = ALL_ANIMALS.find((a) => a.id === targetAnimalId);
      if (targetAnimal) {
        soundFx.speakText(targetAnimal.name);
      }

      const nextMatched = new Set(matchedAnimalIds);
      nextMatched.add(targetAnimalId);
      setMatchedAnimalIds(nextMatched);
      setSelectedName(null);

      // Check if all animals in level are matched
      if (nextMatched.size >= levelAnimals.length) {
        // Victory!
        setTimeout(() => {
          soundFx.play('win');
          soundFx.play('win_coin');
          setIsVictory(true);
          onSaveLevelCompletion(levelNumber, hearts);
        }, 600);
      }
    } else {
      // INCORRECT MATCH!
      soundFx.play('wrong');
      soundFx.play('wrong_guess');

      setWrongShakeAnimalId(targetAnimalId);
      setTimeout(() => setWrongShakeAnimalId(null), 600);

      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setSelectedName(null);

      if (nextHearts <= 0) {
        // Game Over!
        setTimeout(() => {
          soundFx.play('lose');
          setIsGameOver(true);
        }, 500);
      }
    }
  };

  const handleNextLevel = () => {
    const nextLevelNum = levelNumber + 1;
    if (nextLevelNum <= PRESET_LEVELS.length) {
      // Proceed to next level
      setIsVictory(false);
      // Trigger new level setup via prop change or parent callback
      onSaveLevelCompletion(levelNumber, hearts);
      window.location.hash = `level=${nextLevelNum}`;
    } else {
      // Completed all levels! Return to level select
      onGoToLevelSelect();
    }
  };

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.play('click');
  };

  const hasNextLevel = !isRandomMode && levelNumber < PRESET_LEVELS.length;

  return (
    <div className="relative w-full min-h-screen min-h-dvh overflow-y-auto flex flex-col items-center justify-between p-1.5 sm:p-4 select-none">
      {/* Background */}
      <img
        src="/assets/BG.png"
        alt="Funiko Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none filter brightness-95"
      />

      {/* Top Header Navigation & Status Bar */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between px-2 sm:px-4 py-1 xs:py-1.5 bg-amber-950/75 border-2 border-amber-600/80 rounded-2xl backdrop-blur-sm shadow-xl gap-1">
        {/* Left: Hearts / Health Container (Darah.png) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-amber-200 font-extrabold text-[10px] xs:text-xs sm:text-base hidden sm:inline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Nyawa:
          </span>
          {[1, 2, 3].map((heartIndex) => {
            const isAlive = heartIndex <= hearts;
            return (
              <div key={heartIndex} className="relative w-5 h-5 xs:w-7 xs:h-7 sm:w-10 sm:h-10 transition-all duration-300">
                <img
                  src={isAlive ? '/assets/Darah.png' : '/assets/Darah kosong.png'}
                  alt={isAlive ? 'Hati' : 'Hati Kosong'}
                  className={`w-full h-full object-contain filter drop-shadow-md ${
                    isAlive ? 'animate-pulse' : 'opacity-40 grayscale'
                  }`}
                  onError={(e) => {
                    if (!isAlive) {
                      (e.target as HTMLImageElement).style.opacity = '0.2';
                    }
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Center: Level Title & Score Badge */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="text-amber-300 text-xs xs:text-sm sm:text-2xl font-extrabold tracking-widest"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              WebkitTextStroke: '0.5px #78350f',
              letterSpacing: '0.12em',
            }}
          >
            {isRandomMode ? 'MODE ACAK' : `LEVEL ${levelNumber}`}
          </div>
          <div className="text-white text-[9px] xs:text-[10px] sm:text-xs font-bold bg-amber-900/80 px-1.5 xs:px-2 sm:px-3 py-0.5 rounded-full border border-amber-600 shadow-inner" style={{ letterSpacing: '0.08em' }}>
            Ditebak: {matchedAnimalIds.size} / {levelAnimals.length}
          </div>
        </div>

        {/* Right: Controls (Pause & Sound) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            id="game-sound-btn"
            onClick={toggleSound}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-lg transition-transform active:scale-90 touch-manipulation min-w-[36px] min-h-[36px]"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            id="game-pause-btn"
            onClick={() => {
              soundFx.play('click');
              setIsPaused(true);
            }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-900/80 hover:bg-amber-800 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-lg transition-transform active:scale-90 touch-manipulation min-w-[36px] min-h-[36px]"
            title="Jeda Permainan"
          >
            <img
              src="/assets/Btn_ Paused.png"
              alt="Pause"
              className="w-5 h-5 sm:w-7 sm:h-7 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </button>
        </div>
      </div>

      {/* Main Animals Display Area (Top Section) */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center my-auto p-1 sm:p-2">
        <div
          className={`grid gap-1.5 sm:gap-4 md:gap-6 w-full max-w-5xl justify-items-center items-center ${
            levelAnimals.length <= 2
              ? 'grid-cols-2 max-w-xs sm:max-w-xl'
              : levelAnimals.length <= 4
              ? 'grid-cols-2 sm:grid-cols-4 max-w-sm sm:max-w-4xl'
              : 'grid-cols-3 sm:grid-cols-3 md:grid-cols-6 max-w-full sm:max-w-5xl'
          }`}
        >
          {levelAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              isMatched={matchedAnimalIds.has(animal.id)}
              selectedName={selectedName}
              onDropName={handleDropName}
              isWrongShake={wrongShakeAnimalId === animal.id}
              totalAnimals={levelAnimals.length}
            />
          ))}
        </div>
      </div>

      {/* Bottom Draggable / Clickable Name Plates Area */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center pb-1 sm:pb-2">
        <div className="text-amber-200/90 text-[11px] xs:text-xs sm:text-sm font-bold mb-1 sm:mb-2 text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          {selectedName ? (
            <span className="text-amber-300 font-extrabold animate-pulse">
              👉 Sedang memilih: &quot;{selectedName.name}&quot; — Klik kotak di bawah hewan yang cocok!
            </span>
          ) : (
            'Tarik atau ketuk nama hewan di bawah untuk memasangkannya:'
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 px-1.5 py-1.5 min-h-[48px] sm:min-h-[64px] bg-amber-950/60 border-2 border-amber-700/60 rounded-2xl w-full">
          {shuffledNames.map((animal) => (
            <NamePlate
              key={animal.id}
              animal={animal}
              isSelected={selectedName?.id === animal.id}
              onSelect={(item) => {
                soundFx.play('click');
                setSelectedName((prev) => {
                  if (prev?.id === item.id) {
                    return null;
                  } else {
                    soundFx.speakText(item.name);
                    return item;
                  }
                });
              }}
              isMatched={matchedAnimalIds.has(animal.id)}
              totalAnimals={levelAnimals.length}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {isGameOver && (
        <GameOverModal
          onRetry={setupLevel}
          onSelectLevel={onGoToLevelSelect}
          onGoToLobby={onGoToMainMenu}
        />
      )}

      {isVictory && (
        <VictoryModal
          levelNumber={levelNumber}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onReplay={setupLevel}
          onSelectLevel={onGoToLevelSelect}
          heartsLeft={hearts}
          onOpenRewards={onOpenRewards}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={setupLevel}
          onSelectLevel={onGoToLevelSelect}
          onGoToLobby={onGoToMainMenu}
        />
      )}
    </div>
  );
};
