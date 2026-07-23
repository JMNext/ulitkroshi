import happyVideoMov from '/src/assets/resources/1stpet-animation/happy.mov';
import happyVideoWebm from '/src/assets/resources/1stpet-animation/happy.webm';

export const HappyPetVideo = () => {
  return (
    <div className="flex items-center justify-center box-border shrink-0 select-none w-[644px] h-[644px] relative">
      <video
        className="object-contain block contrast-[110%] brightness-[105%] w-full h-full relative z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        {/* iOS подхватит MOV, Android/Desktop выберут WebM */}
        <source src={happyVideoMov} type='video/mp4; codecs="hvc1"' />
        <source src={happyVideoWebm} type="video/webm" />
        Ваш browser не поддерживает видео.
      </video>
    </div>
  );
};
