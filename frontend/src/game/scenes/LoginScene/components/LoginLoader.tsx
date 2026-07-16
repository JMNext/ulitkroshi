import React, { useState, useEffect, useRef } from 'react';
import begemotImg from '../../../../assets/login_assets/begemot.png';

interface LoginLoaderProps {
  onComplete: () => void;
}

export const LoginLoader = ({ onComplete }: LoginLoaderProps) => {
  const [progress, setProgress] = useState<number>(0);
  const onCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 0.015, 1);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        clearInterval(interval);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const begemotRotation = Math.sin(progress * 30) * 6;

  return (
    <section className="login-controls-wrapper">
      <nav className="login-loading-bar">
        <nav className="login-loading-track">
          <nav
            style={{ width: `${progress * 100}%` }}
            className="login-loading-fill"
          />
          <nav
            style={{
              left: `${progress * 100}%`,
              transform: `translateX(-50%) rotate(${begemotRotation}deg)`
            }}
            className="login-loading-runner"
          >
            <img
              src={begemotImg}
              className="login-runner-img"
              alt="begemot"
            />
          </nav>
        </nav>
      </nav>
    </section>
  );
};
