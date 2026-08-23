import React from 'react';
import { Animal } from '../types';

interface NamePlateProps {
  animal: Animal;
  isSelected: boolean;
  onSelect: (animal: Animal) => void;
  isMatched: boolean;
  totalAnimals?: number;
}

export const NamePlate: React.FC<NamePlateProps> = ({
  animal,
  isSelected,
  onSelect,
  isMatched,
  totalAnimals = 4,
}) => {
  const plateSizeClass =
    totalAnimals >= 5
      ? 'w-[92px] xs:w-[110px] sm:w-[150px] md:w-[170px] h-[32px] xs:h-[38px] sm:h-[48px]'
      : totalAnimals >= 3
      ? 'w-[110px] xs:w-[130px] sm:w-[170px] md:w-[190px] h-[36px] xs:h-[44px] sm:h-[54px]'
      : 'w-[125px] xs:w-[145px] sm:w-[190px] md:w-[210px] h-[40px] xs:h-[48px] sm:h-[58px]';

  const fontClass =
    totalAnimals >= 5
      ? 'text-[10px] xs:text-xs sm:text-base md:text-lg'
      : totalAnimals >= 3
      ? 'text-[11px] xs:text-sm sm:text-lg md:text-xl'
      : 'text-xs xs:text-base sm:text-xl md:text-2xl';

  if (isMatched) {
    return <div className={`${plateSizeClass} opacity-0 pointer-events-none`} />;
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: animal.id, name: animal.name }));
    e.dataTransfer.effectAllowed = 'move';
    onSelect(animal);
  };

  return (
    <div
      id={`name-plate-${animal.id}`}
      draggable={!isMatched}
      onDragStart={handleDragStart}
      onClick={() => onSelect(animal)}
      className={`relative ${plateSizeClass} flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 transform touch-manipulation ${
        isSelected
          ? 'scale-105 -translate-y-1.5 ring-4 ring-amber-300 shadow-2xl rounded-lg animate-pulse-slow'
          : 'hover:scale-105 hover:-translate-y-1 hover:rotate-1'
      }`}
    >
      <img
        src="/assets/Btn_.png"
        alt={animal.name}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-md"
      />
      <span
        className={`relative z-10 text-white font-extrabold tracking-widest select-none text-center px-1.5 ${fontClass}`}
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
          WebkitTextStroke: '0.5px #451a03',
          letterSpacing: '0.12em',
        }}
      >
        {animal.name}
      </span>
    </div>
  );
};
