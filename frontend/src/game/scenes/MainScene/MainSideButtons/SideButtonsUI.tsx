import React from 'react';

import buttonBg from '../../../../assets/interface-icons/button.svg';
import fotoIcon from '../../../../assets/interface-icons/foto.svg';
import minigameIcon from '../../../../assets/interface-icons/mini-game.svg';
import mypetsIcon from '../../../../assets/interface-icons/my-pets.svg';
import shopIcon from '../../../../assets/interface-icons/shop.svg';
import './SideButtonsUI.css';

interface GroupButton {
  icon: string;
  src: string;
  id: string;
}

interface SideButtonsUIProps {
  onAction: (id: string) => void;
}

export const SideButtonsUI = ({ onAction }: SideButtonsUIProps) => {
  const renderGroup = (btns: GroupButton[], isLeft: boolean) => (
    <section className={`side-group-container ${isLeft ? 'side-group-left' : 'side-group-right'}`}>
      {btns.map((btn) => (
        <button
          key={btn.id}
          type="button"
          onClick={() => onAction(btn.id)}
          className="side-btn-box"
        >
          <img src={buttonBg} className="side-btn-bg" alt="bg" />
          <span className="side-btn-icon-wrap">
            <img src={btn.src} className="side-btn-icon" alt={btn.icon} />
          </span>
        </button>
      ))}
    </section>
  );

  return (
    <nav className="side-buttons-wrapper">
      {renderGroup([
        { icon: 'shop', src: shopIcon, id: 'ui_open_shop' },
        { icon: 'foto', src: fotoIcon, id: 'ui_take_screenshot' },
      ], true)}
      {renderGroup([
        { icon: 'minigame', src: minigameIcon, id: 'ui_open_minigame' },
        { icon: 'mypets', src: mypetsIcon, id: 'ui_open_pets' },
      ], false)}
    </nav>
  );
};
