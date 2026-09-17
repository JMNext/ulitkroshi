import { clsx } from "clsx";
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
} as const;

// Карта ошибок для стадии 1 избавляет от вложенных тернаров
const STATUS_MESSAGES: Record<string, string> = {
  profane: MESSAGES.statusProfane,
  spaces: MESSAGES.statusSpaces,
  song: MESSAGES.statusSong
};

export const BubbleBlock = () => {
  const { stage, name, nameStatus, nameHistory } = useRegistrationStep1Store();

  const isStage2 = stage === 2;
  const isStage4 = stage === 4;
  const isNamedStage = isStage2 || isStage4;

  // Декларативное и плоское вычисление текста
  let textStr = "";

  if (stage === 1) {
    textStr = STATUS_MESSAGES[nameStatus] || (nameHistory.length > 0 ? MESSAGES.historyChange : MESSAGES.defaultWelcome);
  } else if (isNamedStage) {
    textStr = `${name}${isStage2 ? "?" : ""}`;
  } else if (stage === 3) {
    textStr = MESSAGES.notHeard;
  }

  return (
    <div className="pointer-events-none absolute top-[30px] left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[540px] origin-top -translate-x-1/2 flex-col transition-all duration-150 select-none">
      <div className="relative box-border flex w-full flex-col items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center shadow-md">
        {isNamedStage && (
          <span className="mb-1 text-[18px] font-semibold break-words whitespace-normal text-slate-500 antialiased">
            {isStage2 ? MESSAGES.labelNamed : MESSAGES.labelGreeting}
          </span>
        )}
        <p
          className={clsx(
            "m-0 text-center text-[22px] leading-snug font-black break-words whitespace-pre-line antialiased",
            isNamedStage ? "text-[36px] text-emerald-900" : "text-slate-800"
          )}
        >
          {textStr}
        </p>

        {/* Хвостик баббла (стрелочка) */}
        <div className="absolute bottom-[-18px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -z-10 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[18px] border-x-transparent border-t-slate-200" />
      </div>
    </div>
  );
};
