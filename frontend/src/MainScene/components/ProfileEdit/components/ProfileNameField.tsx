import editBtnIcon from "@/assets/interface-icons/button_edit.svg";
import { useRef, useState, useEffect } from "react";

interface ProfileNameFieldProps { currentName: string; setUsername: (name: string) => void; }

export const ProfileNameField = ({ currentName, setUsername }: ProfileNameFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setVal(currentName); }, [currentName]);

  const handleEdit = () => { setIsEditing(true); setTimeout(() => inputRef.current?.focus(), 0); };

  const handleSave = () => {
    setIsEditing(false);
    const clean = val.trim();
    if (!clean) return setVal(currentName);
    setUsername(clean);
  };

  return (
    <div className="relative mx-auto flex h-[40px] w-full max-w-[280px] items-center justify-center font-black">
      {!isEditing ? (
        <div className="flex items-center justify-center select-none">
          <span onClick={handleEdit} className="max-w-[190px] cursor-pointer overflow-hidden text-[26px] leading-none text-ellipsis whitespace-nowrap text-[#1a3d1c] landscape:text-[22px]">{currentName}</span>
          <button type="button" onClick={handleEdit} className="-mt-[5px] ml-1 flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-0 landscape:-mt-[3px]">
            <img src={editBtnIcon} className="h-10 w-10 object-contain landscape:h-8 landscape:w-8" alt="" />
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2">
          <input ref={inputRef} type="text" maxLength={20} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()} onBlur={handleSave} className="box-border h-[38px] w-full max-w-[190px] rounded-[12px] border-2 border-[#e2e8f0] bg-[#f8fafc] text-center text-[20px] font-black text-[#1a3d1c] outline-none focus:border-[#81c714] landscape:h-[32px] landscape:text-[16px]" />
        </div>
      )}
    </div>
  );
};
