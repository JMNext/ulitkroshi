import React from 'react';
import { Typography } from 'antd';
import { useMainGameStore } from '../useMainGameStore';

import startPetImg from '/src/assets/start-pet.png';

interface PetsModalProps {
  onClose: () => void;
}

export const PetsModal = ({ onClose }: PetsModalProps) => {
  const activePetIndex = useMainGameStore((state) => state.activePetIndex);
  const setActivePetIndex = useMainGameStore((state) => state.setActivePetIndex);

  const gridCells = Array.from({ length: 20 }).map((_, index) => {
    const isActive = index === activePetIndex;
    return (
      <button 
        key={index}
        onClick={() => index === 0 && setActivePetIndex(index)}
        className={`aspect-square flex items-center justify-center rounded-2xl border-2 p-1.5 outline-none transition-all ${
          isActive 
            ? 'bg-[#fffde7] border-[#ffca28]' 
            : 'bg-slate-50 border-slate-200'
        } ${index === 0 ? 'cursor-pointer hover:border-[#ffca28]' : 'opacity-60 cursor-not-allowed'}`}
      >
        {index === 0 ? (
          <img src={startPetImg} className="w-full h-full object-contain p-1.5" alt="start-pet" />
        ) : (
          <span className="flex items-center justify-center w-[44px] h-[44px] bg-white rounded-full border border-slate-300 font-black text-slate-400 text-[22px]">
            ?
          </span>
        )}
      </button>
    );
  });

  return (
    <section 
      className="flex flex-col w-[480px] p-8 bg-white rounded-[32px] border-4 border-[#ffca28] box-border select-none" 
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex justify-between items-center w-full mb-5">
        <Typography.Title level={3} className="!m-0 !p-0 !font-black !text-[#1a3d1c] tracking-wide !text-[26px]">
          Мои питомцы (1/20)
        </Typography.Title>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600 transition-colors font-bold bg-transparent border-none text-[29px] cursor-pointer outline-none"
        >
          ✕
        </button>
      </header>
      
      <div className="grid grid-cols-5 gap-3 w-full overflow-y-auto pr-1 py-1.5">
        {gridCells}
      </div>
    </section>
  );
};
