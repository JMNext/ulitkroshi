import { Typography } from 'antd';
import { usePetCareStore } from '../usePetCareStore';
import startPetImg from '/src/assets/start-pet.png';

export const PetsModal = ({ onClose }: { onClose: () => void }) => {
  const activePetIndex = usePetCareStore((state) => state.activePetIndex);
  const setActivePetIndex = usePetCareStore((state) => state.setActivePetIndex);

  const gridCells = Array.from({ length: 20 }).map((_, index) => {
    const isActive = index === activePetIndex;
    return (
      <button 
        key={index}
        onClick={() => index === 0 && setActivePetIndex(index)}
        className={`w-full aspect-square flex items-center justify-center rounded-2xl border-[3px] p-1.5 outline-none transition-all ${
          isActive 
            ? 'bg-[#fffde7] border-[#ffca28] shadow-md scale-95' 
            : 'bg-slate-50 border-slate-200 active:scale-95'
        } ${index === 0 ? 'cursor-pointer hover:border-[#ffca28]' : 'opacity-50 cursor-not-allowed'}`}
      >
        {index === 0 ? (
          <img src={startPetImg} className="w-full h-full object-contain p-0.5" alt="start-pet" />
        ) : (
          <span className="flex items-center justify-center w-[36px] h-[36px] bg-white rounded-full border border-slate-300 font-black text-slate-400 text-[18px]">
            ?
          </span>
        )}
      </button>
    );
  });

  return (
    <section 
      className="flex flex-col bg-white rounded-[36px] border-[5px] border-[#ffca28] box-border select-none shadow-2xl transition-all duration-100 w-screen h-auto min-h-0
        portrait:max-w-[90vw] portrait:max-h-[82vh] portrait:p-6
        landscape:max-w-[500px] landscape:max-h-[90vh] landscape:p-6" 
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex justify-between items-center w-full mb-4 shrink-0">
        <Typography.Title level={3} className="!m-0 !p-0 !font-black !text-[#1a3d1c] tracking-wide !text-[24px] portrait:!text-[22px] landscape:!text-[20px]">
          Мои питомцы (1/20)
        </Typography.Title>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600 transition-colors font-bold bg-transparent border-none text-2xl cursor-pointer outline-none p-1 flex items-center justify-center"
        >
          ✕
        </button>
      </header>
      
      <div className="grid gap-3 w-full overflow-hidden pr-1 py-1 flex-1 content-start min-h-0
        portrait:grid-cols-4 
        landscape:grid-cols-5"
      >
        {gridCells}
      </div>
    </section>
  );
};
