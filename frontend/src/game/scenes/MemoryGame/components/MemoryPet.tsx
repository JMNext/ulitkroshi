import React, { useEffect } from 'react';
import petIdleWebm from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petIdleMov from '/src/assets/resources/1stpet-animation/prostoi-converted.mov';
import petPlayWebm from '/src/assets/resources/1stpet-animation/play-converted.webm';
import petPlayMov from '/src/assets/resources/1stpet-animation/play-converted.mov';
import { useMemoryGameStore } from '../useMemoryGameStore';

export const MemoryPet = () => {
  const isWash = useMemoryGameStore((state) => state.isWash);

  useEffect(() => {
    const container = document.getElementById('game-container');
    if (!container) return;

    document.getElementById('memory-html-pet-entity')?.remove();

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const currentIdleSrc = isIOS ? petIdleMov : petIdleWebm;
    const currentPlaySrc = isIOS ? petPlayMov : petPlayWebm;

    const createVideo = (src: string, loop = false) => {
      const video = document.createElement('video');
      video.src = src; 
      Object.assign(video, { muted: true, playsInline: true, autoplay: loop, loop });
      Object.assign(video.style, { 
        width: '100%', height: '100%', objectFit: 'fill', 
        filter: 'contrast(110%) brightness(105%)', position: 'relative', zIndex: '10' 
      });
      return video;
    };

    const vIdle = createVideo(currentIdleSrc, true);
    const vPlay = createVideo(currentPlaySrc);
    vPlay.style.display = 'none';
    vPlay.onended = () => useMemoryGameStore.getState().setWash(false);

    const petBox = document.createElement('div');
    petBox.id = 'memory-pet-box-target';
    Object.assign(petBox.style, { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%' });
    petBox.appendChild(vIdle); petBox.appendChild(vPlay);

    const innerWrapper = document.createElement('div');
    innerWrapper.id = 'memory-pet-inner-wrapper'; innerWrapper.style.position = 'relative';
    innerWrapper.appendChild(petBox);

    const element = document.createElement('div');
    element.id = 'memory-html-pet-entity';
    element.className = 'absolute inset-0 w-full h-full z-35 overflow-hidden bg-transparent pointer-events-none flex items-center justify-center';
    element.appendChild(innerWrapper); container.appendChild(element);

    const executeResize = () => {
      const w = window.innerWidth, h = window.innerHeight, port = h > w;

      if (port) {
        Object.assign(innerWrapper.style, { width: '100%', height: '100%', transform: 'none' });
        if (h < 700) return void (element.style.display = 'none');
        element.style.display = 'flex';

        const size = 160;
        Object.assign(petBox.style, { width: `${size}px`, height: `${size}px`, left: '50%', transform: 'translateX(-50%)', right: 'auto', bottom: 'auto' });

        const isEasy = useMemoryGameStore.getState().deck.length === 8;
        const gridH = isEasy ? 340 : 480;
        const scaleY = Math.min((w * 0.96) / (isEasy ? 340 : 440), (h - 300) / gridH, 1);
        petBox.style.top = `${Math.floor((h - gridH * scaleY) / 2) - size - 25}px`;
      } else {
        element.style.display = 'flex';
        if (w < 1300) {
          Object.assign(innerWrapper.style, { width: '100%', height: '100%', transform: 'none' });
          const isTablet = (w / h) < 1.75;
          const size = isTablet ? 240 : 160;
          Object.assign(petBox.style, { width: `${size}px`, height: `${size}px`, transform: 'translateY(-50%)', right: 'auto', bottom: 'auto' });

          const gridW = Math.min(w - 340, h - 180, 520);
          petBox.style.left = `${Math.floor((w - gridW) / 2) - (size / 2) - (isTablet ? 100 : 120)}px`;
          petBox.style.top = `${Math.floor((h - gridW) / 2) + (gridW / 2) + (isTablet ? 60 : 20)}px`;
        } else {
          const scale = Math.min(w / 1920, h / 1080, 1);
          Object.assign(innerWrapper.style, { width: '1920px', height: '1080px', transform: `scale(${scale})`, transformOrigin: 'center center' });
          Object.assign(petBox.style, { width: '340px', height: '340px', transform: 'none', top: 'auto', right: 'auto', bottom: '280px', left: '160px' });
        }
      }
    };

    executeResize();
    window.addEventListener('resize', executeResize);
    return () => { window.removeEventListener('resize', executeResize); element.remove(); };
  }, []);

  useEffect(() => {
    const petBox = document.getElementById('memory-pet-box-target');
    const videos = petBox?.getElementsByTagName('video');
    
    if (videos && videos.length >= 2) {
      const vIdle = videos[0]; 
      const vPlay = videos[1]; 

      if (isWash) {
        vIdle.style.display = 'none'; 
        vPlay.style.display = 'block';
        vIdle.pause(); 
        vPlay.currentTime = 0; 
        vPlay.play().catch(() => {});
      } else {
        vPlay.style.display = 'none'; 
        vIdle.style.display = 'block';
        vPlay.pause(); 
        vIdle.play().catch(() => {});
      }
    }
  }, [isWash]);

  return null;
};
