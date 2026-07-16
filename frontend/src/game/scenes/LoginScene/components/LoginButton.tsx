import { Button } from 'antd';
import { useState } from 'react';

interface LoginButtonProps {
  onStart: () => Promise<void> | void;
}

export const LoginButton = ({ onStart }: LoginButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onStart();
    } catch (error) {
      console.error('Ошибка при входе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-controls-wrapper pointer-events-auto">
      <Button
        type="primary"
        onClick={handleClick}
        loading={isLoading}
        disabled={isLoading}
        className="login-start-btn">
        ВОЙТИ
      </Button>
    </section>
  );
};
