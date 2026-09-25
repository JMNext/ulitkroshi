import Phaser from "phaser";
import { preloadSharedAssets } from "@/game/MiniGamesShared/preloadSharedAssets";
import { PET_ANIMATION_URLS } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import carImgUrl from "@/assets/resources/car.png";

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloaderScene" });
  }

  public preload(): void {
    this.cameras.main.setBackgroundColor("#000000");

    const w = Number(this.scale.width), h = Number(this.scale.height);
    const progressText = this.add.text(w / 2, h / 2, "Загрузка ресурсов: 0%", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressText.setText(`Загрузка ресурсов: ${Math.floor(value * 100)}%`);
    });

    // 1. Статические фоны интерфейса через безопасный URL
    this.load.image("login_bg_goriz", new URL("/src/assets/login_assets/load_goriz.png", window.location.origin).href);
    this.load.image("login_bg_vert", new URL("/src/assets/login_assets/load_vert.png", window.location.origin).href);
    this.load.image("game_bg_goriz", new URL("/src/assets/background/fon_goriz.png", window.location.origin).href);
    this.load.image("game_bg_vert", new URL("/src/assets/background/fon_vert.png", window.location.origin).href);

    // 2. Выкачиваем ресурсы всех мини-игр
    preloadSharedAssets(this, "snake");
    preloadSharedAssets(this, "racing");
    preloadSharedAssets(this, "memory", true);
    preloadSharedAssets(this, "catch");
    this.load.image("player_car", carImgUrl);

    // 3. ИСПРАВЛЕНО: Автоматически выкачиваем все видео-анимации питомца в кэш браузера!
    Object.keys(PET_ANIMATION_URLS).forEach((key) => {
      const urls = PET_ANIMATION_URLS[key];
      // Проверяем, какой формат поддерживает текущий браузер, и ставим в очередь загрузки
      const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      const videoUrl = isApple ? urls.mov : urls.webm;

      if (videoUrl) {
        // Загружаем видео как бинарный файл (XHR), чтобы браузер железно опустил его в кэш диска
        this.load.binary(`video_pet_${key}`, videoUrl);
      }
    });
  }

  public create(): void {
    // Вся графика, мини-игры и тяжелые видео пета в кэше! Запускаем!
    this.scene.start("LoginScene");
  }
}
