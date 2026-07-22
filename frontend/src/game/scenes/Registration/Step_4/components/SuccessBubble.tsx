export const SuccessBubble = () => {
  return (
    <div className="flex flex-col items-center box-border select-none pointer-events-none w-[520px]">
      <div className="w-full h-auto bg-white border border-slate-200 rounded-[36px] shadow-xl flex flex-col items-center justify-center text-center box-border py-8 px-10">
        <p className="font-black text-slate-700 leading-normal tracking-wide m-0 p-0 block text-[24px]">
          Поздравляю!<br />Ты владелец<br />улиткроша!
        </p>
      </div>
      
      <div className="w-full flex justify-center items-start mt-[-1px] box-border">
        <div className="w-0 h-0 border-t-white border-x-transparent border-b-transparent drop-shadow-black/5 border-l-[14px] border-r-[14px] border-t-[14px]" />
      </div>
    </div>
  );
};
