// SuccessBubble.tsx
export const SuccessBubble = () => {
  return (
    <div className="flex flex-col items-center box-border select-none pointer-events-none w-[455px]">
      <div className="w-full h-auto bg-white border border-slate-200 rounded-[32px] shadow-xl flex flex-col items-center justify-center text-center box-border pt-6 pb-6 px-8">
        <p className="font-black text-slate-700 leading-normal tracking-wide m-0 p-0 block text-[24px]">
          Поздравляю!<br />Ты владелец<br />улиткроша!
        </p>
      </div>
      
      <div className="w-full flex justify-center items-start mt-[-1px] box-border">
        <div className="w-0 h-0 border-t-white border-x-transparent border-b-transparent drop-shadow-black/5 border-l-[12px] border-r-[12px] border-t-[12px]" />
      </div>
    </div>
  );
};
