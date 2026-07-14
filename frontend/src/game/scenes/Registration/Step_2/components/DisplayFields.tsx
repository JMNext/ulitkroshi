interface DisplayFieldsProps {
  mode: 'phone' | 'sent' | 'code';
  isPortrait: boolean;
  phone: string;
  code: string;
}

export const DisplayFields = ({ mode, isPortrait, phone, code }: DisplayFieldsProps) => {
  const renderCodeDisplay = () => {
    return code.padEnd(4, '_').split('').join(' ');
  };

  if (mode !== 'code') {
    return (
      <div className={`w-full ${isPortrait ? 'h-[64px] text-[20px]' : 'h-[76px] text-[26px]'} bg-white flex items-center justify-center font-black rounded-full shadow-lg border border-slate-50 text-slate-700 tracking-wide box-border mt-1`}>
        {phone}
      </div>
    );
  }

  return (
    <div className={`w-full ${isPortrait ? 'h-[64px] text-[32px]' : 'h-[76px] text-[40px]'} bg-white flex items-center justify-center font-black rounded-full shadow-lg border border-slate-50 text-slate-700 tracking-[12px] pl-[12px] box-border mt-1`}>
      {renderCodeDisplay()}
    </div>
  );
};
