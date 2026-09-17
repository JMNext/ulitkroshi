import begemotImg from "@/assets/login_assets/begemot.png";
import { useLoginStore } from "../store/useLoginStore";

export const LoginLoader = () => {
  const progress = useLoginStore((state) => state.progress);

  // Упростили расчет: если прогресс есть, вычисляем ширину, иначе 0
  const currentWidth = progress ? Math.max(36, 376 * progress) : 0;

  return (
    <div className="animate-fade-in pointer-events-auto relative box-border flex h-[40px] w-[380px] shrink-0 origin-center -translate-y-[50px] scale-100 transform items-center justify-center rounded-[20px] border-2 border-white bg-[#ede9e6] p-0 select-none landscape:-translate-y-[30px]">
      <div
        className="absolute top-0 left-0 h-[36px] rounded-[18px] bg-[#f9b300] transition-all duration-75 ease-out"
        style={{ width: currentWidth }} // Передали число напрямую, Tailwind v4/React добавит px автоматически
      />
      <img
        src={begemotImg}
        className="absolute bottom-[-2px] h-[64px] w-[64px] object-contain transition-all duration-75 ease-out"
        style={{ left: currentWidth - 14 }}
        alt=""
      />
    </div>
  );
};
