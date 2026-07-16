import { Scene } from 'phaser';
import React, { Fragment } from 'react';
import { createRoot, Root } from 'react-dom/client';
 
import { ProfileEditUI } from './ProfileEdit/ProfileEditUI';
import { ShopModal } from './ShopModal/ShopModal';
import { MainBottomMenuUI } from './MainBottomMenu/MainBottomMenuUI'; 
import { PetCharacter } from './PetCharacter/PetCharacter';
import { HeaderUI } from './MainHeader/HeaderUI';
import { SideButtonsUI } from './MainSideButtons/SideButtonsUI';
import { MinigameModalUI } from '../../../ui/components/MinigameModal/MinigameModal';
import { PetsModalComponent } from './PetsModal/PetsModal';
import { PetHealthBar } from './PetHealthBar/PetHealthBar';

import { useMainGameStore } from './useMainGameStore';
import { usePetCareStore } from './usePetCareStore';
import { takeScreenshot } from './takeScreenshot';

const PetAndMenuCombinedUI = ({ scene }: { scene: any }) => {
  const currentAnim = usePetCareStore((state) => state.currentAnim);
  return React.createElement(Fragment, null, [
    React.createElement('div', { key: 'pet-wrap', className: 'absolute inset-0 pointer-events-none z-10' }, 
      React.createElement(PetCharacter, {
        currentAnim,
        onAnimationComplete: (anim) => scene.events?.emit('pet_animation_complete', anim)
      })
    ),
    React.createElement('div', { key: 'menu-wrap', className: 'game-ui-overlay z-30 pointer-events-none' }, 
      React.createElement(MainBottomMenuUI, { scene })
    )
  ]);
};

export class MainScene extends Scene {
  public currentHp = 100;
  public coins = 0;
  public username = `Player${Math.floor(1000 + Math.random() * 9000)}`;
  public petName = 'Булька';
  public currentPetState = 'prostoi1'; 
  public currentWashState: 'idle' | 'hidden' | 'glowing' = 'idle';
  
  private safetyTimeout: Phaser.Time.TimerEvent | null = null;
  private sleepSound: Phaser.Sound.BaseSound | null = null;
  private roots: Record<string, { id: string; r: Root | null; component: () => React.ReactElement }> = {};

  constructor() { super('MainScene'); }

  public preload(): void {
    const s = { eat: '/src/assets/resources/sound/eat.MP3?url', play: '/src/assets/resources/sound/play .MP3?url', wash: '/src/assets/resources/sound/wash.MP3?url', sleep: '/src/assets/resources/sound/sleep.mp3?url' };
    Object.entries(s).forEach(([k, url]) => !this.cache.audio.exists(k) && this.load.audio(k, url));
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)').fadeIn(500);
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    
    const { setCoins, setHp, setPetName, setUsername } = useMainGameStore.getState();
    setCoins(this.coins); setHp(this.currentHp); setPetName(this.petName); setUsername(this.username);

    usePetCareStore.getState().setCurrentAnim(this.currentPetState);
    usePetCareStore.getState().setWashState(this.currentWashState);

    this.roots = {
      header: { id: 'main-header-global-overlay', r: null, component: () => React.createElement(HeaderUI, { onPlusClick: () => this.renderUI('shop'), onAvatarClick: () => this.renderUI('profile') }) },
      side: { id: 'main-side-ui-overlay', r: null, component: () => React.createElement(SideButtonsUI, { onAction: (id) => id === 'ui_open_shop' ? this.renderUI('shop') : id === 'ui_open_minigame' ? this.renderUI('minigame') : id === 'ui_open_pets' ? this.renderUI('pets') : this.events.emit(id) }) },
      health: { id: 'main-health-ui-overlay', r: null, component: () => React.createElement(PetHealthBar) }, 
      profile: { id: 'profile-edit-ui-overlay', r: null, component: () => React.createElement(ProfileEditUI, { onClose: () => { this.updateStore('prostoi1', 'idle'); this.destroyUI('profile'); }, onAddPetClick: () => { this.destroyUI('profile'); this.renderUI('pets'); } }) }, 
      shop: { id: 'shop-modal-overlay', r: null, component: () => React.createElement(ShopModal, { onClose: () => this.destroyUI('shop') }) },
      pets: { id: 'pets-modal-overlay', r: null, component: () => React.createElement(PetsModalComponent, { onClose: () => this.destroyUI('pets') }) },
      minigame: { id: 'minigame-modal-ui-overlay', r: null, component: () => React.createElement(MinigameModalUI, { onClose: () => this.destroyUI('minigame'), onStartGame: (sceneKey, difficulty) => { this.scene.start(sceneKey, { difficulty }); this.destroyUI('minigame'); } }) },
      petAndMenu: { id: 'main-pet-and-menu-overlay', r: null, component: () => React.createElement(PetAndMenuCombinedUI, { scene: this }) }
    };

    const evts = {
      'care_trigger_wash': () => this.playCare('wash'), 'care_trigger_play': () => this.playCare('play'), 'care_trigger_eat': () => this.playCare('eat'),
      'ui_open_shop': () => this.renderUI('shop'), 'ui_open_profile_edit': () => this.renderUI('profile'), 'ui_open_minigame': () => this.renderUI('minigame'), 'ui_open_pets': () => this.renderUI('pets'),
      'ui_take_screenshot': () => takeScreenshot(this), 'character_sleep_begin': () => this.handleSleep(true), 'character_sleep_awake': () => this.handleSleep(false),
      'pet_animation_complete': (k: string) => this.animComplete(k)
    };
    Object.entries(evts).forEach(([e, cb]) => this.events.on(e, cb, this));

    // Добавлен запуск независимого слоя 'health'
    ['header', 'side', 'health', 'petAndMenu'].forEach(k => this.renderUI(k));

    this.events.once('shutdown', () => { 
      Object.keys(this.roots).forEach(k => this.destroyUI(k)); 
      this.safetyTimeout?.destroy(); this.sleepSound?.stop(); 
      useMainGameStore.getState().resetStore(); usePetCareStore.getState().resetStore();
    }, this);
  }

  public renderUI(key: string): void {
    const cfg = this.roots[key]; if (!cfg) return;
    let el = document.getElementById(cfg.id);
    if (!el) {
      el = document.createElement('div'); el.id = cfg.id;
      const isModal = ['shop', 'pets', 'minigame', 'profile'].includes(key);
      el.className = key === 'petAndMenu' ? 'absolute inset-0 z-30 pointer-events-none' : `absolute inset-0 z-40 pointer-events-${isModal ? 'auto' : 'none'}`;
      document.getElementById('game-container')?.appendChild(el);
    }
    if (!cfg.r) cfg.r = createRoot(el);
    cfg.r.render(cfg.component());
  }

  private destroyUI(key: string): void {
    const cfg = this.roots[key]; if (!cfg) return;
    if (cfg.r) { try { cfg.r.unmount(); } catch {} cfg.r = null; }
    document.getElementById(cfg.id)?.remove();
  }

  private updateStore(anim: string, wash: 'idle' | 'hidden' | 'glowing'): void {
    this.currentPetState = anim; this.currentWashState = wash;
    const store = usePetCareStore.getState();
    store.setCurrentAnim(anim); store.setWashState(wash);
  }

  private playCare(state: string): void {
    if (!['prostoi1', 'prostoi2'].includes(this.currentPetState)) return;
    this.sound.play(state);
    this.updateStore(state, 'hidden');
    this.safetyTimeout = this.time.delayedCall(3500, () => this.animComplete(this.currentPetState));
  }

  private handleSleep(begin: boolean): void {
    let nextState = this.currentPetState;
    if (begin && ['prostoi1', 'prostoi2'].includes(this.currentPetState)) nextState = 'sleep_begin';
    else if (!begin && this.currentPetState === 'sleep_circle') { this.sleepSound?.stop(); this.sleepSound = null; nextState = 'sleep_awake'; }
    else return;

    this.updateStore(nextState, 'hidden');
    this.safetyTimeout = this.time.delayedCall(3500, () => this.animComplete(this.currentPetState));
  }

  private animComplete(key: string): void {
    if (!this.scene.isActive(this.scene.key) || this.currentPetState !== key) return;
    this.safetyTimeout?.destroy();

    if (key === 'sleep_begin') {
      this.sleepSound = this.sound.add('sleep', { loop: true, volume: 0.75 });
      this.sleepSound.play();
      this.updateStore('sleep_circle', 'hidden');
    } else {
      this.updateStore('prostoi1', 'idle');
    }
  }
}
