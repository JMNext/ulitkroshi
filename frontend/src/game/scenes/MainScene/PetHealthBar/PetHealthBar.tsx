import lifeIcon from '../../../../assets/interface-icons/life.svg';
import { useMainGameStore } from '../useMainGameStore';
import { usePetCareStore } from '../usePetCareStore';
import './HealthUI.css';

export const PetHealthBar = () => {
  const hp = useMainGameStore((state) => state.hp);
  const petName = useMainGameStore((state) => state.petName);
  const washState = usePetCareStore((state) => state.washState);

  const isHidden = washState === 'hidden';

  return (
    <div className="health-bar-wrapper">
      <section
        className={`health-bar-container ${isHidden ? 'health-bar-hidden' : 'health-bar-visible'}`}>
        <section className="pet-name-container">
          <span className="pet-name-text">{petName}</span>
        </section>
        <section className="health-bar-body">
          <section className="health-bar-inner-wrap">
            <img
              src={lifeIcon}
              className="health-bar-life-icon"
              alt="life"
            />
            <section className="health-bar-bg-track">
              <section
                style={{ width: `${hp}%` }}
                className="health-bar-fill"
              />
            </section>
          </section>
        </section>
        <span className="health-bar-percentage-text">{hp}%</span>
      </section>
    </div>
  );
};
