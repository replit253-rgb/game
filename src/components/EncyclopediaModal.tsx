import React, { useState } from 'react';
import { ALL_ANIMALS } from '../data/animals';
import { Animal } from '../types';
import { soundFx } from '../utils/audio';
import { Volume2 } from 'lucide-react';

interface EncyclopediaModalProps {
  onClose: () => void;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ onClose }) => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal>(ALL_ANIMALS[0]);

  const handleSelect = (animal: Animal) => {
    soundFx.play('click');
    setSelectedAnimal(animal);
    soundFx.speakText(animal.name);
  };

  const handleSpeak = () => {
    soundFx.speakText(selectedAnimal.name);
  };

  const handleClose = () => {
    soundFx.play('click');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-1.5 xs:p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-amber-950/95 border-4 border-amber-600 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="relative flex items-center justify-between px-3 xs:px-4 sm:px-6 py-2.5 border-b-2 border-amber-800 bg-amber-900/60 gap-2">
          <h2
            className="text-base xs:text-xl sm:text-3xl font-extrabold text-amber-300 tracking-widest truncate"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              WebkitTextStroke: '0.5px #78350f',
              letterSpacing: '0.1em',
            }}
          >
            🐾 Galeri Satwa Funiko
          </h2>
          <button
            id="encyclopedia-close-btn"
            onClick={handleClose}
            className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-lg xs:text-xl flex items-center justify-center shadow-lg transition-transform active:scale-90 shrink-0 min-w-[36px] min-h-[36px]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-2.5 xs:p-4 overflow-y-auto">
          {/* Animal list */}
          <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[35vh] md:max-h-[60vh] overflow-y-auto pr-1">
            {ALL_ANIMALS.map((animal) => {
              const isSelected = selectedAnimal.id === animal.id;
              return (
                <button
                  key={animal.id}
                  id={`encyclopedia-item-${animal.id}`}
                  onClick={() => handleSelect(animal)}
                  className={`flex flex-col items-center p-1.5 xs:p-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-amber-500/30 ring-3 ring-amber-400 scale-105 shadow-lg'
                      : 'bg-amber-900/30 hover:bg-amber-900/60 hover:scale-102'
                  }`}
                >
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 object-contain filter drop-shadow"
                  />
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-amber-100 text-center mt-1 truncate w-full">
                    {animal.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Featured Preview */}
          <div className="bg-amber-900/40 border-2 border-amber-700/60 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center justify-between">
            <div className="w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 flex items-center justify-center p-1">
              <img
                src={selectedAnimal.image}
                alt={selectedAnimal.name}
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl animate-playful"
              />
            </div>

            <div className="flex items-center gap-2 mt-1 xs:mt-2">
              <h3
                className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-widest"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px #78350f',
                  letterSpacing: '0.1em',
                }}
              >
                {selectedAnimal.name}
              </h3>
              <button
                id="encyclopedia-speak-btn"
                onClick={handleSpeak}
                className="p-1.5 xs:p-2 rounded-full bg-amber-600 hover:bg-amber-500 text-amber-100 shadow-md transition-transform active:scale-90"
                title="Dengarkan Pengucapan Nama"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="w-full text-left bg-amber-950/60 rounded-xl p-2.5 xs:p-3 mt-2 sm:mt-3 border border-amber-800/80 space-y-1 text-xs sm:text-sm text-amber-100">
              {selectedAnimal.category && (
                <div>
                  <span className="font-bold text-amber-400">Jenis: </span>
                  {selectedAnimal.category}
                </div>
              )}
              {selectedAnimal.habitat && (
                <div>
                  <span className="font-bold text-amber-400">Habitat: </span>
                  {selectedAnimal.habitat}
                </div>
              )}
              {selectedAnimal.food && (
                <div>
                  <span className="font-bold text-amber-400">Makanan: </span>
                  {selectedAnimal.food}
                </div>
              )}
              {selectedAnimal.funFact && (
                <div className="pt-1 text-amber-200 italic border-t border-amber-800/50 text-[11px] xs:text-xs">
                  💡 &quot;{selectedAnimal.funFact}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-amber-900/40 border-t border-amber-800 text-center text-xs text-amber-300/80">
          Koleksi 20 Hewan Lucu & Unik • Funiko Game
        </div>
      </div>
    </div>
  );
};
