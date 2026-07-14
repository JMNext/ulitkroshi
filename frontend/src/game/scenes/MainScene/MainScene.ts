import { Scene } from 'phaser';
import { BackgroundManager } from '../../../BackgroundManager';
import { showMinigameModal } from '../../../ui/components/MinigameModal';
import { ActionPetCharacter } from './animations/ActionPetCharacter';
import { BasePetCharacter } from './animations/BasePetCharacter';
import { WashPetCharacter } from './animations/WashPetCharacter';
import { destroyMainBottomMenuUI, renderMainBottomMenuUI } from './MainBottomMenuUI';
import { destroyMainHeaderUI, renderMainHeaderUI } from './MainHeaderUI';
import { MainPetPosition } from './MainPetPosition';
import { destroyMainSideButtonsUI, renderMainSideButtonsUI } from './MainSideButtonsUI';
import { destroyMainHealthUI, renderMainHealthUI } from './PetHealthBar';
import { showPetsModal } from './PetsModal';
import { renderProfileEditUI } from './ProfileEditUI';
import { showShopModal } from './ShopModal';
import { takeScreenshot } from './takeScreenshot';

import soundEat from '/src/assets/resources/sound/eat.MP3?url';
import soundPlay from '/src/assets/resources/sound/play .MP3?url';
import soundWashMp3 from '/src/assets/resources/sound/wash.MP3?url';

export class MainScene extends Scene {
  public baseCharacter: BasePetCharacter | null = null;
  public actionCharacter: ActionPetCharacter | null = null;
  public washCharacter: WashPetCharacter | null = null;
  public currentHp = 100;
  private currentWashState: 'idle' | 'hidden' | 'glowing' = 'idle';
  private glowingTimeout: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super('MainScene');
  }

  public preload = (): void => {
    if (!this.cache.audio.exists('eat')) this.load.audio('eat', soundEat);
    if (!this.cache.audio.exists('play')) this.load.audio('play', soundPlay);
    if (!this.cache.audio.exists('wash')) this.load.audio('wash', soundWashMp3);
  };

  public create = (): void => {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    this.cameras.main.fadeIn(500, 0, 0, 0);

    MainPetPosition.getInstance(this);

    this.baseCharacter = new BasePetCharacter(this, 'prostoi1');
    this.actionCharacter = new ActionPetCharacter(this, this.baseCharacter);
    this.washCharacter = new WashPetCharacter(this, this.baseCharacter);

    BackgroundManager.getInstance().applyBackground(this);
    this.initGameEvents();
    this.buildUI();
    this.events.once('shutdown', this.handleShutdown, this);
  };

  private initGameEvents = (): void => {
    this.events.on('care_trigger_wash', this.playWashSequence, this);
    this.events.on('care_trigger_play', this.playPlaySequence, this);
    this.events.on('ui_open_shop', this.handleOpenShop, this);
    this.events.on('ui_open_minigame', this.handleOpenMinigame, this);
    this.events.on('ui_open_pets', this.handleOpenPets, this);
    this.events.on('ui_take_screenshot', this.handleTakeScreenshot, this);
    this.events.on('ui_open_profile_edit', this.handleOpenProfileEdit, this);
    this.events.on('ui_hide_health_bar', this.handleHideHealthBar, this);
    this.events.on('character_sleep_begin', this.handleSleepBegin, this);
    this.events.on('pet_animation_complete', this.handlePetAnimationComplete, this);
  };

  private buildUI = (): void => {
    renderMainHeaderUI(this);
    renderMainSideButtonsUI(this);
    renderMainBottomMenuUI(this);
    renderMainHealthUI(this, this.currentWashState, this.currentHp);
  };

  public updateHealthBarPosition = (washState: 'idle' | 'hidden' | 'glowing'): void => {
    if (this.glowingTimeout) {
      this.glowingTimeout.destroy();
      this.glowingTimeout = null;
    }
    this.currentWashState = washState;
    if (this.scene.isActive(this.scene.key)) {
      renderMainHealthUI(this, this.currentWashState, this.currentHp);
    }
  };

  public playWashSequence = (): void => {
    if (!this.washCharacter || this.actionCharacter?.currentAnim) return;
    this.updateHealthBarPosition('hidden');
    this.washCharacter.play();
  };

  public playPlaySequence = (): void => {
    if (!this.actionCharacter || this.washCharacter?.isActiveAnim) return;
    this.updateHealthBarPosition('hidden');
    this.actionCharacter.play('play');
  };

  private handleOpenShop = (): void => showShopModal();
  private handleOpenMinigame = (): void => showMinigameModal(this);
  private handleOpenPets = (): void => showPetsModal();
  private handleTakeScreenshot = (): void => takeScreenshot(this);
  private handleOpenProfileEdit = (): void => renderProfileEditUI(this);
  private handleHideHealthBar = (): void => this.updateHealthBarPosition('hidden');

  private handleSleepBegin = (): void => {
    this.updateHealthBarPosition('hidden');
    this.baseCharacter?.toggleSleep();
  };

  private handlePetAnimationComplete = (animationKey: string): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    if (['wash', 'play', 'eat'].includes(animationKey)) {
      this.updateHealthBarPosition('glowing');
      this.glowingTimeout = this.time.delayedCall(1000, () => this.updateHealthBarPosition('idle'));
    } else if (animationKey === 'sleep_awake') {
      this.updateHealthBarPosition('idle');
    }
  };

  private handleShutdown = (): void => {
    this.events.off('care_trigger_wash', this.playWashSequence, this);
    this.events.off('care_trigger_play', this.playPlaySequence, this);
    this.events.off('ui_open_shop', this.handleOpenShop, this);
    this.events.off('ui_open_minigame', this.handleOpenMinigame, this);
    this.events.off('ui_open_pets', this.handleOpenPets, this);
    this.events.off('ui_take_screenshot', this.handleTakeScreenshot, this);
    this.events.off('ui_open_profile_edit', this.handleOpenProfileEdit, this);
    this.events.off('ui_hide_health_bar', this.handleHideHealthBar, this);
    this.events.off('character_sleep_begin', this.handleSleepBegin, this);
    this.events.off('pet_animation_complete', this.handlePetAnimationComplete, this);

    if (this.glowingTimeout) this.glowingTimeout.destroy();

    destroyMainHeaderUI();
    destroyMainSideButtonsUI();
    destroyMainBottomMenuUI();
    destroyMainHealthUI();

    if (this.baseCharacter) {
      this.baseCharacter.destroy();
      this.baseCharacter = null;
    }
    if (this.actionCharacter) {
      this.actionCharacter.destroy();
      this.actionCharacter = null;
    }
    if (this.washCharacter) {
      this.washCharacter.destroy();
      this.washCharacter = null;
    }

    MainPetPosition.getInstance().destroy();
    BackgroundManager.getInstance().clearBackground();
  };
}
