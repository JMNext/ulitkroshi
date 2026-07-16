import React, { SyntheticEvent } from 'react';
import './MobileControlsUI.css';

interface MobileControlsProps {
  type: 'horizontal' | 'cross';
  onChangeDir: (dir: string | number) => void;
}

export const MobileControlsUI = ({ type, onChangeDir }: MobileControlsProps) => {
  const handleActionStart = (dir: string | number) => (event: SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onChangeDir(dir);
  };

  const handleActionEnd = () => (event: SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (type === 'horizontal') {
      onChangeDir(0);
    }
  };

  if (type === 'horizontal') {
    return (
      <nav className="mobile-controls-horizontal-bar">
        <button
          type="button"
          onTouchStart={handleActionStart('LEFT')}
          onTouchEnd={handleActionEnd()}
          onMouseDown={handleActionStart('LEFT')}
          onMouseUp={handleActionEnd()}
          onMouseLeave={handleActionEnd()}
          className="control-btn"
        >
          <span className="arrow-triangle is-left block" />
        </button>
        <button
          type="button"
          onTouchStart={handleActionStart('RIGHT')}
          onTouchEnd={handleActionEnd()}
          onMouseDown={handleActionStart('RIGHT')}
          onMouseUp={handleActionEnd()}
          onMouseLeave={handleActionEnd()}
          className="control-btn"
        >
          <span className="arrow-triangle is-right block" />
        </button>
      </nav>
    );
  }

  return (
    <nav className="mobile-controls-cross-wrapper">
      <div className="mobile-controls-cross-grid">
        <button
          type="button"
          onTouchStart={handleActionStart('UP')}
          onMouseDown={handleActionStart('UP')}
          className="control-btn pos-up"
        >
          <span className="arrow-triangle is-up block" />
        </button>
        <button
          type="button"
          onTouchStart={handleActionStart('DOWN')}
          onMouseDown={handleActionStart('DOWN')}
          className="control-btn pos-down"
        >
          <span className="arrow-triangle is-down block" />
        </button>
        <button
          type="button"
          onTouchStart={handleActionStart('LEFT')}
          onMouseDown={handleActionStart('LEFT')}
          className="control-btn pos-left"
        >
          <span className="arrow-triangle is-left block" />
        </button>
        <button
          type="button"
          onTouchStart={handleActionStart('RIGHT')}
          onMouseDown={handleActionStart('RIGHT')}
          className="control-btn pos-right"
        >
          <span className="arrow-triangle is-right block" />
        </button>
      </div>
    </nav>
  );
};
