import petVideoUrl from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';

export const PetVideoBlock = () => {
  return (
    <div className="flex items-center justify-center box-border shrink-0 select-none w-[644px] h-[644px]">
      <video
        src={petVideoUrl}
        className="object-contain block contrast-[110%] brightness-[105%] w-full h-full"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
      />
    </div>
  );
};
