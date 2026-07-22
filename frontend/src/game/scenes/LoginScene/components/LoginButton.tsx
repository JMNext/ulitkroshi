import { useState } from 'react';
import { Spin } from 'antd';

interface LoginButtonProps {
  onStart: () => Promise<void> | void;
}

export const LoginButton = ({ onStart }: LoginButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try { 
      await onStart(); 
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-[18px] flex items-center justify-center font-black text-white uppercase tracking-wider shadow-lg active:scale-95 transition-transform duration-100 outline-none box-border cursor-pointer origin-bottom select-none pointer-events-auto border-t-2 border-t-[#a6f034] border-x-0 border-b-0 bg-gradient-to-b from-[#81c714] to-[#4c9203] w-[240px] h-[60px] text-[24px] ${
        isLoading 
          ? 'opacity-80 cursor-not-allowed pointer-events-none' 
          : 'opacity-100'
      }`}
    >
      {isLoading ? (
        <Spin size="small" style={{ color: '#fff' }} />
      ) : (
        'ВОЙТИ'
      )}
    </button>
  );
};
