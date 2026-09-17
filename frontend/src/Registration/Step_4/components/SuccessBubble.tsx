const MESSAGES = {
  success: "Поздравляю! Ты владелец улиткроша!"
} as const;

export const SuccessBubble = () => {
  return (
    <div className="pointer-events-none absolute top-[30px] left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[540px] origin-top -translate-x-1/2 flex-col transition-all duration-150 select-none">
      <div className="relative box-border flex w-full items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center shadow-md">
        <p className="m-0 text-[24px] leading-snug font-black break-words whitespace-normal text-slate-700 antialiased">
          {MESSAGES.success}
        </p>

        {/* Стрелочка баббла */}
        <div className="absolute bottom-[-18px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -z-10 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-slate-200" />
      </div>
    </div>
  );
};
