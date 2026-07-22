import React, { useState } from 'react';
import { Input } from 'antd';
import { useMainGameStore } from '../useMainGameStore';
import editButtonIcon from '/src/assets/interface-icons/button_edit.svg';
import avatarIcon from '/src/assets/interface-icons/icon-avatar.svg';

interface ProfileEditUIProps {
  onClose: () => void;
  onAddPetClick?: () => void;
}

export const ProfileEditUI = ({ onClose, onAddPetClick }: ProfileEditUIProps) => {
  const username = useMainGameStore((state) => state.username);
  const setUsername = useMainGameStore((state) => state.setUsername);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(username);

  const saveEdit = () => {
    const trimmed = inputValue.replace(/\s+/g, ' ').trim();
    if (trimmed.length > 0) setUsername(trimmed);
    setIsEditing(false);
  };

  return (
    <div 
      className="bg-white border-[4px] border-[#ffca28] flex flex-col items-center justify-center w-[370px] h-[310px] p-[22px] rounded-[24px] relative shadow-xl select-none box-border" 
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="text-slate-400 font-bold text-[24px] border-none bg-transparent cursor-pointer outline-none absolute top-4 right-5 hover:text-slate-600 transition-colors" 
        onClick={onClose}
      >
        ✕
      </button>

      <button 
        className="flex items-end justify-center w-[95px] h-[95px] mb-3 bg-transparent border-none p-0 cursor-pointer relative outline-none" 
        onClick={() => { setInputValue(username); setIsEditing(true); }}
      >
        <img src={avatarIcon} className="w-full h-full object-cover rounded-full" alt="avatar" />
        <img src={editButtonIcon} className="w-[30px] h-[30px] ml-[-30px] absolute z-10" alt="edit" />
      </button>

      {isEditing ? (
        <div className="flex items-center justify-center gap-1.5 w-full mb-4 px-2">
          <Input
            autoFocus 
            maxLength={20} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={saveEdit}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsEditing(false); }}
            className="w-[65%] h-[34px] px-3 py-1 bg-[#f8fafc] border-2 border-slate-200 rounded-xl font-black text-[#1a3d1c] text-center text-[17px] outline-none"
          />
          <button 
            onClick={saveEdit} 
            className="flex items-center justify-center w-[34px] h-[34px] border-none bg-[#61aa05] hover:bg-[#529004] transition-colors text-white rounded-xl font-black text-sm cursor-pointer shadow-sm outline-none"
          >
            ✓
          </button>
        </div>
      ) : (
        <h2 
          className="w-full font-black text-[#1a3d1c] text-center text-[21px] truncate mb-4 cursor-pointer" 
          onClick={() => { setInputValue(username); setIsEditing(true); }}
        >
          {username}
        </h2>
      )}

      <button 
        onClick={onAddPetClick} 
        className="w-full h-12 mb-1 border-none bg-gradient-to-b from-[#ff9800] to-[#f57c00] hover:from-[#f57c00] hover:to-[#e65100] transition-all text-white font-black rounded-full text-[15px] uppercase tracking-wide cursor-pointer shadow-md outline-none"
      >
        Добавить питомца
      </button>
      
      <button 
        className="mt-3 text-xs font-black text-slate-400 underline bg-transparent border-none cursor-pointer outline-none" 
        onClick={onClose}
      >
        Вернуться назад
      </button>
    </div>
  );
};
