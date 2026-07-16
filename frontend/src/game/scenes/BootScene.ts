import { Scene } from 'phaser';
import { useAuthStore } from '../../store/useAuthStore';

export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    // Получаем метод автоматического восстановления сессии из нашего Zustand-хранилища
    const { refreshToken } = useAuthStore.getState();
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      // ТЗ PublicRoute: токена нет — отправляем на экран логина
      this.scene.start('LoginScene');
      return;
    }

    try {
      // ТЗ PrivateRoute: перепроверяем и обновляем токен через бэк
      const success = await refreshToken();
      
      if (success) {
        // Токен валиден — пускаем в игру!
        this.scene.start('MainScene');
      } else {
        // Токен протух и рефреш не удался — на логин
        this.scene.start('LoginScene');
      }
    } catch (error) {
      // Любая сетевая ошибка — на логин
      this.scene.start('LoginScene');
    }
  }
}
