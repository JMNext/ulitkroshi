import { memo } from 'react';

interface ScannerTopTipProps {
  mode: 'qr' | 'code';
}

export const ScannerTopTip = memo(({ mode }: ScannerTopTipProps) => {
  return (
    <div className="w-full max-w-[300px] sm:max-w-[340px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px] box-border flex justify-center items-center bg-[#fcf9f2] border-4 border-solid border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-[20px] p-3 z-50 font-black text-center select-none shrink-0 mx-auto mt-2 [@media(orientation:landscape)_and_(max-height:500px)]:mt-0">
      <p className="text-[16px] sm:text-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:text-[14px] leading-snug m-0 text-[#33502b] font-black uppercase tracking-wide whitespace-pre-line antialiased">
        {mode === 'qr' ? 'Наведи на QR-код\nигрушки' : 'Введите цифровой\nкод игрушки'}
      </p>
    </div>
  );
});
