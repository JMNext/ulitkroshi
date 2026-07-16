import React from 'react';
import { Typography } from 'antd';
import { useMainGameStore } from '../useMainGameStore';
import './PetsModal.css';

import startPetImg from '/src/assets/start-pet.png';

interface PetsModalComponentProps {
  onClose: () => void;
}

export const PetsModalComponent = ({ onClose }: PetsModalComponentProps) => {
  const activePetIndex = useMainGameStore((state) => state.activePetIndex);
  const setActivePetIndex = useMainGameStore((state) => state.setActivePetIndex);

  return (
    <main className="pets-modal-backdrop" onClick={onClose}>
      <section className="pets-modal-card" onClick={(e) => e.stopPropagation()}>
        <nav className="pets-modal-header">
          <Typography.Title level={3} className="pets-modal-title">
            Мои питомцы (1/20)
          </Typography.Title>
          <button onClick={onClose} className="pets-modal-close">
            ✕
          </button>
        </nav>
        
        <nav className="pets-modal-grid">
          {Array.from({ length: 20 }).map((_, index) => {
            const isActive = index === activePetIndex;
            return (
              <section 
                key={index}
                onClick={() => index === 0 && setActivePetIndex(index)}
                className={`pets-grid-cell ${isActive ? 'active' : ''} ${
                  index > 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-95'
                }`}
              >
                {index === 0 ? (
                  <img src={startPetImg} className="w-full h-full object-contain p-1.5 pointer-events-none" alt="start-pet" />
                ) : (
                  <nav className="pets-question-circle">?</nav>
                )}
              </section>
            );
          })}
        </nav>
      </section>
    </main>
  );
};
