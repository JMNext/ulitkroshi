import { clsx } from "clsx";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

const MSG = {
  named: "Меня зовут",
  greeting: "Здорово! Меня зовут",
  profane: `Ой-ёй-ёй, это имя не подходит!\nДавай выберем другое, доброе имя.`,
  spaces: `Имя должно быть только в одно слово!\nПридумай имя без пробелов.`,
  song: `Это больше похоже на песню,\nа не на имя! 🎵`,
  change: "Эх, а мне так нравилось... Ну ладно, тогда как меня будут звать? Придумай другое имя!",
  welcome: "Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!",
  notHeard: `Ой, я не расслышал!\nДавай ещё разок, громче и чётче!`
} as const;

const MAP: Record<string, string> = { profane: MSG.profane, spaces: MSG.spaces, song: MSG.song };

export const BubbleBlock = () => {
  const { stage, name, nameStatus, nameHistory } = useRegistrationStep1Store();
  const isNamed = stage === 2 || stage === 4;

  let text = "";
  if (stage === 1) text = MAP[nameStatus] || (nameHistory.length ? MSG.change : MSG.welcome);
  else if (isNamed) text = `${name}${stage === 2 ? "?" : ""}`;
  else if (stage === 3) text = MSG.notHeard;

  return (
    <div className="pointer-events-none absolute top-[30px] left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[540px] origin-top -translate-x-1/2 flex-col select-none">
      <div className="relative box-border flex w-full flex-col items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center shadow-md">
        {isNamed && <span className="mb-1 text-[18px] font-semibold text-slate-500 antialiased">{stage === 2 ? MSG.named : MSG.greeting}</span>}
        <p className={clsx("m-0 text-center text-[22px] leading-snug font-black break-words whitespace-pre-line antialiased", isNamed ? "text-[36px] text-emerald-900" : "text-slate-800")}>{text}</p>
        <div className="absolute bottom-[-18px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -z-10 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-slate-200" />
      </div>
    </div>
  );
};
