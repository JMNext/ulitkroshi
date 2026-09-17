import happyMov from "@/assets/resources/1stpet-animation/happy.mov";
import happyWebm from "@/assets/resources/1stpet-animation/happy.webm";

export const HappyPetVideo = () => {
  return (
    <div className="pointer-events-none absolute top-[460px] left-1/2 z-0 h-[644px] w-[644px] origin-center -translate-x-1/2 -translate-y-1/2 scale-100 overflow-visible bg-transparent transition-all duration-150 select-none">
      <video
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="pointer-events-none absolute top-1/2 left-1/2 block h-auto w-full -translate-x-1/2 -translate-y-1/2 border-none bg-transparent object-contain object-bottom outline-none"
        style={{ imageRendering: "crisp-edges" }}
      >
        <source src={happyMov} type="video/quicktime" />
        <source src={happyWebm} type="video/webm; codecs=vp9,vorbis" />
      </video>
    </div>
  );
};
