import React from 'react';
import { createRoot, Root } from 'react-dom/client';

let petsRoot: Root | null = null;
const CONTAINER_ID = 'pets-modal-overlay';

export function showPetsModal(): void {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!petsRoot) petsRoot = createRoot(container);
  petsRoot.render(<PetsModalComponent />);
}

export function hidePetsModal(): void {
  if (petsRoot) { petsRoot.unmount(); petsRoot = null; }
  document.getElementById(CONTAINER_ID)?.remove();
}

function PetsModalComponent() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-[500px] max-h-[80vh] flex flex-col shadow-2xl border-4 border-[#ffca28]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#1a3d1c] font-bold text-2xl">Мои питомцы (1/20)</h3>
          <button onClick={hidePetsModal} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">✕</button>
        </div>
        <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 py-2">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-inner relative overflow-hidden">
              {index === 0 ? (
                <img src="/assets/start-pet.png" className="w-full h-full object-contain p-1" alt="start-pet" />
              ) : (
                <div className="w-[44px] h-[44px] bg-white rounded-full flex items-center justify-center font-bold text-slate-400 border border-slate-300 text-xl shadow-sm">?</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
