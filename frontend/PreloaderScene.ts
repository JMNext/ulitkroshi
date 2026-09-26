import Phaser from "phaser";
import carImgUrl from "@/assets/resources/car.png";
import loadGorizUrl from "@/assets/login_assets/load_goriz.png";
import loadVertUrl from "@/assets/login_assets/load_vert.png";
import fonGorizUrl from "@/assets/background/fon_goriz.png";
import fonVertUrl from "@/assets/background/fon_vert.png";
import bgMusicUrl from "@/assets/resources/sound/main_theme.mp3";
import begemotImgUrl from "@/assets/login_assets/begemot.png";

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

    this.load.image("login_bg_goriz", loadGorizUrl);
    this.load.image("login_bg_vert", loadVertUrl);
    this.load.image("game_bg_goriz", fonGorizUrl);
    this.load.image("game_bg_vert", fonVertUrl);
    this.load.audio("main_background_theme", bgMusicUrl);
    this.load.image("player_car", carImgUrl);
    this.load.image("loader_begemot", begemotImgUrl);
  }

  public create(): void {
    const bgMusic = this.sound.add("main_background_theme", { loop: true, volume: 0.4 });

    const startAudio = () => {
      const soundManager = this.sound as any;
      if (soundManager.context && soundManager.context.state === "suspended") {
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

    this.scene.start("LoginScene");
  }
}
