import React, { useState } from 'react';
import { Animal } from '../types';

interface AnimalCardProps {
  animal: Animal;
  isMatched: boolean;
  selectedName: { id: string; name: string } | null;
  onDropName: (targetAnimalId: string, droppedNameId: string) => void;
  isWrongShake: boolean;
  totalAnimals?: number;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  isMatched,
  selectedName,
  onDropName,
  isWrongShake,
  totalAnimals = 4,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isMatched) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isMatched) return;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && data.id) {
          onDropName(animal.id, data.id);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleTargetClick = () => {
    if (isMatched) return;
    if (selectedName) {
      onDropName(animal.id, selectedName.id);
    }
  };

  // Dynamic responsive sizing classes based on level animal count
  const imgSizeClass =
    totalAnimals >= 5
      ? 'max-w-[70px] xs:max-w-[90px] sm:max-w-[150px]'
      : totalAnimals >= 3
      ? 'max-w-[100px] xs:max-w-[130px] sm:max-w-[180px]'
      : 'max-w-[130px] xs:max-w-[170px] sm:max-w-[220px]';

  const slotSizeClass =
    totalAnimals >= 5
      ? 'max-w-[90px] xs:max-w-[120px] sm:max-w-[180px] h-[32px] xs:h-[38px] sm:h-[50px]'
      : totalAnimals >= 3
      ? 'max-w-[115px] xs:max-w-[150px] sm:max-w-[200px] h-[36px] xs:h-[44px] sm:h-[56px]'
      : 'max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] h-[40px] xs:h-[48px] sm:h-[60px]';

  const fontClass =
    totalAnimals >= 5
      ? 'text-[10px] xs:text-[11px] sm:text-base'
      : totalAnimals >= 3
      ? 'text-[11px] xs:text-xs sm:text-lg'
      : 'text-xs xs:text-sm sm:text-xl';

  return (
    <div
      id={`animal-card-${animal.id}`}
      className={`relative flex flex-col items-center justify-between p-1 sm:p-2 rounded-2xl transition-all duration-300 ${
        isWrongShake ? 'animate-shake' : ''
      } ${
        isDragOver
          ? 'scale-105 ring-4 ring-amber-400 bg-amber-400/20'
          : selectedName && !isMatched
          ? 'hover:bg-amber-400/10 cursor-pointer'
          : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleTargetClick}
    >
      {/* Animal Image Container */}
      <div className={`relative w-full aspect-square ${imgSizeClass} flex items-center justify-center p-1 sm:p-2`}>
        <img
          src={animal.image}
          alt={animal.name}
          className={`w-full h-full object-contain filter drop-shadow-xl transition-all duration-300 ${
            isMatched ? 'scale-105 brightness-105 animate-pop' : 'hover:scale-108 hover:-translate-y-1'
          }`}
          draggable={false}
        />
        {isMatched && (
          <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 sm:p-1 shadow-lg animate-bounce">
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Target Slot (BarBawah.png) */}
      <div className={`relative w-full ${slotSizeClass} flex items-center justify-center mt-1`}>
        <img
          src="/assets/BarBawah.png"
          alt="Slot Nama"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {isMatched ? (
          // Matched Name Board
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-pop">
            <img
              src="/assets/Btn_.png"
              alt={animal.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <span
              className={`relative z-10 text-white font-extrabold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] px-1 text-center ${fontClass}`}
              style={{
                WebkitTextStroke: '0.5px #451a03',
                letterSpacing: '0.12em',
              }}
            >
              {animal.name}
            </span>
          </div>
        ) : (
          // Empty Drop Indicator
          <div className={`relative z-10 text-amber-900/80 font-bold tracking-widest uppercase text-center px-1 ${fontClass}`}>
            {selectedName ? (
              <span className="text-amber-950 font-extrabold animate-pulse" style={{ letterSpacing: '0.08em' }}>
                Pasang Sini
              </span>
            ) : (
              <span style={{ letterSpacing: '0.08em' }}>Tempat Nama</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
