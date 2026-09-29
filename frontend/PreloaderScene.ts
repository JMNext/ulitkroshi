import Phaser from "phaser";
import carImgUrl from "@/assets/resources/car.png";
import loadGorizUrl from "@/assets/login_assets/load_goriz.png";
import loadVertUrl from "@/assets/login_assets/load_vert.png";
import fonGorizUrl from "@/assets/background/fon_goriz.png";
import fonVertUrl from "@/assets/background/fon_vert.png";
import bgMusicUrl from "@/assets/resources/sound/main_theme.mp3";
import begemotImgUrl from "@/assets/login_assets/begemot.png";

export class PreloaderScene extends Phaser.Scene {
  private progressText?: Phaser.GameObjects.Text;
  private hasTransitioned = false;

  constructor() {
    super({ key: "PreloaderScene" });
  }

  public preload(): void {
    this.cameras.main.setBackgroundColor("#1a1a1a");

    const w = Number(this.scale.width) || window.innerWidth || 360;
    const h = Number(this.scale.height) || window.innerHeight || 640;

    this.progressText = this.add.text(w / 2, h / 2, "Загрузка: 0%", {
      fontFamily: "'Arteks Regular', Arial, sans-serif",
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Центрирование при динамическом изменении размера экрана (панели Яндекс Браузера на iOS)
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      if (this.progressText && this.progressText.active) {
        this.progressText.setPosition(gameSize.width / 2, gameSize.height / 2);
      }
    });

    this.load.on("progress", (value: number) => {
      if (this.progressText && this.progressText.active) {
        this.progressText.setText(`Загрузка: ${Math.floor(value * 100)}%`);
      }
    });

    this.load.on("loaderror", (file: any) => {
      console.warn("[Preloader] Ошибка загрузки ассета:", file?.key || file);
    });

    // Загрузка графических ресурсов
    this.load.image("login_bg_goriz", loadGorizUrl);
    this.load.image("login_bg_vert", loadVertUrl);
    this.load.image("game_bg_goriz", fonGorizUrl);
    this.load.image("game_bg_vert", fonVertUrl);
    this.load.image("player_car", carImgUrl);
    this.load.image("loader_begemot", begemotImgUrl);

    // Загрузка фонового аудио
    try {
      this.load.audio("main_background_theme", bgMusicUrl);
    } catch (e) {
      console.warn("[Preloader] Ошибка вызова load.audio:", e);
    }

    // ТАЙМАУТ БЕЗОПАСНОСТИ ДЛЯ МОБИЛЬНЫХ БРАУЗЕРОВ (Яндекс Браузер / iOS WKWebView):
    // В iOS WKWebView при suspended AudioContext вызов decodeAudioData для mp3
    // может зависнуть до первого тапа пользователя.
    // Если через 3 секунды загрузчик не отработал, принудительно переходим к LoginScene.
    setTimeout(() => {
      if (!this.hasTransitioned && this.scene.isActive("PreloaderScene")) {
        console.warn("[Preloader] Сработал таймаут безопасности, переход на LoginScene");
        this.transitionToLogin();
      }
    }, 3000);
  }

  public create(): void {
    this.transitionToLogin();
  }

  private transitionToLogin(): void {
    if (this.hasTransitioned) return;
    this.hasTransitioned = true;

    try {
      if (this.cache.audio.exists("main_background_theme")) {
        const bgMusic = this.sound.add("main_background_theme", { loop: true, volume: 0.4 });
        const startAudio = () => {
          const soundManager = this.sound as any;
          if (soundManager?.context && soundManager.context.state === "suspended") {
            soundManager.context.resume().catch(() => {});
          }
          if (!bgMusic.isPlaying) {
            bgMusic.play();
          }
          window.removeEventListener("click", startAudio);
          window.removeEventListener("touchend", startAudio);
        };

        window.addEventListener("click", startAudio, { passive: true });
        window.addEventListener("touchend", startAudio, { passive: true });
      }
    } catch (err) {
      console.warn("[Preloader] Ошибка инициализации аудио:", err);
    }

    this.scene.start("LoginScene");
  }
}
