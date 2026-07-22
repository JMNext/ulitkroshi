import happyVideoUrl from '/src/assets/resources/1stpet-animation/happy.webm';

export const HappyPetVideo = () => {
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="flex items-center justify-center box-border shrink-0 select-none w-[644px] h-[644px] relative">
      {isIOS && <div className="absolute w-[450px] h-[450px] bg-white rounded-full blur-md z-0 pointer-events-none opacity-95" />}
      <video
        src={happyVideoUrl}
        className={`object-contain block contrast-[110%] brightness-[105%] w-full h-full relative z-10 ${isIOS ? 'mix-blend-screen' : ''}`}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};
