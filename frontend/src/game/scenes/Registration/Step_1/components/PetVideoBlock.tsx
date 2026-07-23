import petVideoMov from '/src/assets/resources/1stpet-animation/prostoi-converted.mov';
import petVideoWebm from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';

export const PetVideoBlock = () => {
  return (
    <div className="flex items-center justify-center box-border shrink-0 select-none w-[644px] h-[644px] relative">
      <video
        className="object-contain block contrast-[110%] brightness-[105%] w-full h-full relative z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        {/* iOS нативно подхватит прозрачный MOV с кодеком HEVC */}
        <source src={petVideoMov} type='video/mp4; codecs="hvc1"' />
        {/* Android и Desktop заберут прозрачный WebM с кодеком VP9 */}
        <source src={petVideoWebm} type="video/webm" />
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  );
};
