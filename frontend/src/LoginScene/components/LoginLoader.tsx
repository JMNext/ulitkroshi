import begemotImg from "@/assets/login_assets/begemot.png";
import { useLoginStore } from "../store/useLoginStore";

export const LoginLoader = () => {
  const p = useLoginStore((s) => s.progress);

  // Переводим прогресс в чистые проценты для стабильности верстки
  const pct = p ? Math.min(100, Math.max(0, p * 100)) : 0;

  return (
    <div className="animate-fade-in pointer-events-auto relative box-border flex h-[40px] w-[380px] shrink-0 origin-center -translate-y-[50px] scale-100 items-center justify-center rounded-[20px] border-2 border-white bg-[#ede9e6] p-0 select-none landscape:-translate-y-[30px]">
      {/* Оранжевая полоса прогресса */}
      <div
        className="absolute top-0 left-0 h-[36px] rounded-[18px] bg-[#f9b300]"
        style={{ width: `${pct}%` }}
      />

      {/* Бегущий бегемотик */}
      <img
        src={begemotImg}
        className="absolute bottom-[-2px] h-[64px] w-[64px] object-contain origin-bottom"
        style={{
          left: `${pct}%`,
          transform: "translateX(-50%)" // Центрируем бегемотика относительно текущего процента полосы
        }}
        alt="Загрузка..."
      />
    </div>
  );
};
