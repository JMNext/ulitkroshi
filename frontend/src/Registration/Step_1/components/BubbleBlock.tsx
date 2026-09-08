import React from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

export const BubbleBlock = () => {
  const { 
    stage, 
    name, 
    nameStatus, 
    isNameChecking, 
    nameHistory 
  } = useRegistrationStep1Store();

  const isStage1 = stage === 1;
  const isStage2 = stage === 2;
  const isStage4 = stage === 4;
  const isNamedStage = isStage2 || isStage4;
  const isCheckingStage1 = isNameChecking && isStage1;

  return (
    <div className="absolute left-1/2 top-[30px] w-[calc(100%-32px)] max-w-[540px] -translate-x-1/2 origin-top pointer-events-none select-none z-50 flex flex-col transition-all duration-150">
      <div className="relative box-border flex w-full flex-col items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center font-black shadow-md">
        {isNamedStage && (
          <span className="mb-1 text-[18px] font-semibold break-words whitespace-normal text-slate-500 antialiased">
            {isStage2 ? "Меня зовут" : "Здорово! Меня зовут"}
          </span>
        )}
        <p
          className={`m-0 text-center leading-snug break-words whitespace-pre-line antialiased ${
            isCheckingStage1
              ? "text-[22px] font-semibold text-slate-400"
              : isNamedStage
                ? "text-[36px] font-black text-emerald-900"
                : "text-[22px] font-black text-slate-800"
          }`}
        >
          {isCheckingStage1
            ? "Секундочку, проверяю имя..."
            : isStage1
              ? nameStatus === "taken"
                ? `Это имя уже занято!\nПридумай мне другое имя.`
                : nameStatus === "profane"
                  ? `Ой-ёй-ёй, это имя не подходит!\nДавай выберем другое, доброе имя.`
                  : nameStatus === "spaces"
                    ? `Имя должно быть только в одно слово!\nПридумай имя без пробелов.`
                    : nameHistory.length > 0
                      ? "Эх, а мне так нравилось... Ну ладно, тогда как меня будут звать? Придумай другое имя!"
                      : "Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!"
              : isNamedStage
                ? `${name}${isStage2 ? "?" : ""}`
                : stage === 3
                  ? "Ой, я не расслышал!\nДавай ещё разок, громче и чётче!"
                  : ""}
        </p>
        <div className="absolute bottom-[-18px] left-1/2 h-0 w-0 -translate-x-1/2 border-t-[18px] border-x-[18px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -z-10 h-0 w-0 -translate-x-1/2 border-t-[18px] border-x-[18px] border-x-transparent border-t-slate-200" />
      </div>
    </div>
  );
};
