import React, { useEffect } from 'react';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';
import { useMemoryGameStore } from '../useMemoryGameStore';

export const MemoryPet = () => {
  const isWash = useMemoryGameStore((state) => state.isWash);

  useEffect(() => {
    const container = document.getElementById('game-container');
    if (!container) return;

    document.getElementById('memory-html-pet-entity')?.remove();

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const bgBacking = document.createElement('div');
    bgBacking.id = 'memory-pet-bg-backing';
    bgBacking.style.position = 'absolute';
    bgBacking.style.backgroundColor = '#ffffff';
    bgBacking.style.borderRadius = '50%';
    bgBacking.style.filter = 'blur(6px)';
    bgBacking.style.zIndex = '0';
    bgBacking.style.pointerEvents = 'none';
    bgBacking.style.opacity = '0.95';
    bgBacking.style.display = isIOS ? 'block' : 'none';

    const vIdle = document.createElement('video');
    vIdle.src = petIdleVideo; vIdle.muted = vIdle.playsInline = vIdle.autoplay = vIdle.loop = true;
    vIdle.style.width = vIdle.style.height = '100%'; vIdle.style.objectFit = 'fill';
    vIdle.style.filter = 'contrast(110%) brightness(105%)';
    vIdle.style.position = 'relative'; vIdle.style.zIndex = '10';
    if (isIOS) vIdle.style.mixBlendMode = 'screen';

    const vPlay = document.createElement('video');
    vPlay.src = petPlayVideo; vPlay.muted = vPlay.playsInline = true;
    vPlay.style.width = vPlay.style.height = '100%'; vPlay.style.objectFit = 'fill';
    vPlay.style.filter = 'contrast(110%) brightness(105%)'; vPlay.style.display = 'none';
    vPlay.style.position = 'relative'; vPlay.style.zIndex = '10';
    if (isIOS) vPlay.style.mixBlendMode = 'screen';
    vPlay.onended = () => useMemoryGameStore.getState().setWash(false);

    const petBox = document.createElement('div');
    petBox.id = 'memory-pet-box-target';
    petBox.style.position = 'absolute'; petBox.style.display = 'flex';
    petBox.style.alignItems = petBox.style.justifyContent = 'center';
    petBox.style.overflow = isIOS ? 'visible' : 'hidden'; petBox.style.borderRadius = '50%';
    petBox.appendChild(vIdle); petBox.appendChild(vPlay);

    const innerWrapper = document.createElement('div');
    innerWrapper.id = 'memory-pet-inner-wrapper'; innerWrapper.style.position = 'relative';
    innerWrapper.appendChild(bgBacking);
    innerWrapper.appendChild(petBox);

    const element = document.createElement('div');
    element.id = 'memory-html-pet-entity';
    element.className = 'absolute inset-0 w-full h-full z-35 overflow-hidden bg-transparent pointer-events-none flex items-center justify-center';
    element.appendChild(innerWrapper); container.appendChild(element);

    const executeResize = () => {
      const w = window.innerWidth, h = window.innerHeight, port = h > w;

      if (port) {
        innerWrapper.style.width = innerWrapper.style.height = '100%';
        innerWrapper.style.transform = 'none';
        if (h < 700) { element.style.display = 'none'; return; }
        element.style.display = 'flex';

        const size = 160;
        petBox.style.width = petBox.style.height = `${size}px`;
        petBox.style.left = '50%'; petBox.style.transform = 'translateX(-50%)';
        petBox.style.right = petBox.style.bottom = 'auto';

        const isEasy = useMemoryGameStore.getState().deck.length === 8;
        const gridH = isEasy ? 340 : 480;
        const scaleY = Math.min((w * 0.96) / (isEasy ? 340 : 440), (h - 300) / gridH, 1);
        const startY = Math.floor((h - gridH * scaleY) / 2);

        petBox.style.top = `${startY - size - 25}px`;
      } else {
        element.style.display = 'flex';
        const isTabOrMob = w < 1300;

        if (isTabOrMob) {
          innerWrapper.style.width = innerWrapper.style.height = '100%';
          innerWrapper.style.transform = 'none';

          const isTablet = (w / h) < 1.75;
          
          const size = isTablet ? 240 : 160;
          petBox.style.width = petBox.style.height = `${size}px`;
          petBox.style.transform = 'translateY(-50%)';
          petBox.style.right = petBox.style.bottom = 'auto';

          const gridW = Math.min(w - 340, h - 180, 520);
          const startX = Math.floor((w - gridW) / 2);
          const startY = Math.floor((h - gridW) / 2);

          const currentGap = isTablet ? 100 : 120;
          petBox.style.left = `${startX - (size / 2) - currentGap}px`;
          
          const currentTopOffset = isTablet ? 60 : 20;
          petBox.style.top = `${startY + (gridW / 2) + currentTopOffset}px`;
        } else {
          const scale = Math.min(w / 1920, h / 1080, 1);
          innerWrapper.style.width = '1920px'; innerWrapper.style.height = '1080px';
          innerWrapper.style.transform = `scale(${scale})`; innerWrapper.style.transformOrigin = 'center center';

          const size = 340;
          petBox.style.width = petBox.style.height = `${size}px`; petBox.style.transform = 'none';
          petBox.style.top = petBox.style.right = 'auto';
          petBox.style.bottom = `${60 - 40 + 260}px`; petBox.style.left = '160px';
        }
      }

      const backingSize = parseFloat(petBox.style.width) * 0.75;
      bgBacking.style.width = `${backingSize}px`;
      bgBacking.style.height = `${backingSize}px`;
      bgBacking.style.left = `calc(${petBox.style.left} + (parseInt('${petBox.style.width}') - ${backingSize}px) / 2)`;
      bgBacking.style.top = `calc(${petBox.style.top} + (parseInt('${petBox.style.width}') - ${backingSize}px) / 2)`;
      bgBacking.style.transform = petBox.style.transform;
      bgBacking.style.bottom = petBox.style.bottom;
      bgBacking.style.right = petBox.style.right;
    };

    executeResize();
    window.addEventListener('resize', executeResize);
    return () => { window.removeEventListener('resize', executeResize); element.remove(); };
  }, []);

  useEffect(() => {
    const petBox = document.getElementById('memory-pet-box-target');
    if (!petBox) return;
    const videos = petBox.getElementsByTagName('video');
    if (videos && videos.length >= 2) {
      if (isWash) {
        videos[0].style.display = 'none'; videos[1].style.display = 'block';
        videos[0].pause(); videos[1].currentTime = 0; videos[1].play().catch(() => {});
      } else {
        videos[1].style.display = 'none'; videos[0].style.display = 'block';
        videos[1].pause(); videos[0].play().catch(() => {});
      }
    }
  }, [isWash]);

  return null;
};
