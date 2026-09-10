import React from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

const MESSAGES = {
  labelNamed: "Меня зовут",
  labelGreeting: "Здорово! Меня зовут",
  statusProfane: "Ой-ёй-ёй, это имя не подходит!\nДавай выберем другое, доброе имя.",
  statusSpaces: "Имя должно быть только в одно слово!\nПридумай имя без пробелов.",
  statusSong: "Это больше похоже на песню,\nа не на имя! 🎵",
  historyChange: "Эх, а мне так нравилось... Ну ладно, тогда как меня будут звать? Придумай другое имя!",
  defaultWelcome: "Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!",
  notHeard: "Ой, я не расслышал!\nДавай ещё разок, громче и чётче!"
};

export const BubbleBlock = () => {
  const { 
    stage, 
    name, 
    nameStatus, 
    nameHistory 
  } = useRegistrationStep1Store();

  const isStage1 = stage === 1;
  const isStage2 = stage === 2;
  const isStage4 = stage === 4;
  const isNamedStage = isStage2 || isStage4;

  let textStr = "";
  if (isStage1) {
    if (nameStatus === "profane") textStr = MESSAGES.statusProfane;
    else if (nameStatus === "spaces") textStr = MESSAGES.statusSpaces;
    else if (nameStatus === "song") textStr = MESSAGES.statusSong;
    else if (nameHistory.length > 0) textStr = MESSAGES.historyChange;
    else textStr = MESSAGES.defaultWelcome;
  } else if (isNamedStage) {
    textStr = `${name}${isStage2 ? "?" : ""}`;
  } else if (stage === 3) {
    textStr = MESSAGES.notHeard;
  }

  return (
    <div className="absolute left-1/2 top-[30px] w-[calc(100%-32px)] max-w-[540px] -translate-x-1/2 origin-top pointer-events-none select-none z-50 flex flex-col transition-all duration-150">
      <div className="relative box-border flex w-full flex-col items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center shadow-md">
        {isNamedStage && (
          <span className="mb-1 text-[18px] font-semibold break-words whitespace-normal text-slate-500 antialiased">
            {isStage2 ? MESSAGES.labelNamed : MESSAGES.labelGreeting}
          </span>
        )}
        <p
          className={`m-0 text-center leading-snug break-words whitespace-pre-line antialiased text-[22px] font-black ${
            isNamedStage ? "text-[36px] text-emerald-900" : "text-slate-800"
          }`}
        >
          {textStr}
        </p>
        <div className="absolute bottom-[-18px] left-1/2 h-0 w-0 -translate-x-1/2 border-t-[18px] border-x-[18px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -z-10 h-0 w-0 -translate-x-1/2 border-t-[18px] border-x-[18px] border-x-transparent border-t-slate-200" />
      </div>
    </div>
  );
};
