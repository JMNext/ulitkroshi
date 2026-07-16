import { useState } from 'react';
import { useMainGameStore } from '../useMainGameStore';
import './ProfileEditUI.css';
import editButtonIcon from '/src/assets/interface-icons/button_edit.svg';
import avatarIcon from '/src/assets/interface-icons/icon-avatar.svg';

interface ProfileEditUIProps {
  onClose: () => void;
  onAddPetClick?: () => void;
}

export const ProfileEditUI = ({ onClose, onAddPetClick }: ProfileEditUIProps) => {
  // ИСПРАВЛЕНО: Берем username и setUsername вместо petName
  const username = useMainGameStore((state) => state.username);
  const setUsername = useMainGameStore((state) => state.setUsername);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(username); // ИСПРАВЛЕНО

  const saveEdit = () => {
    const trimmed = inputValue.replace(/\s+/g, ' ').trim();
    if (trimmed.length > 0) {
      setUsername(trimmed); // ИСПРАВЛЕНО
    }
    setIsEditing(false);
  };

  return (
    <div
      className="modal-backdrop-blur"
      onClick={onClose}>
      <div
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="profile-close-btn">
          ✕
        </button>

        <div
          className="profile-avatar-container"
          onClick={() => {
            setInputValue(username); // ИСПРАВЛЕНО
            setIsEditing(true);
          }}>
          <img
            src={avatarIcon}
            className="profile-avatar-img"
            alt="avatar"
          />
          <div className="profile-avatar-edit-icon">
            <img
              src={editButtonIcon}
              className="h-full w-full object-contain"
              alt="edit"
            />
          </div>
        </div>

        {isEditing ? (
          <div className="profile-name-edit-wrap">
            <input
              autoFocus
              type="text"
              maxLength={20}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              onBlur={(e) => {
                if (!e.relatedTarget?.classList.contains('profile-name-submit-btn')) saveEdit();
              }}
              className="profile-name-input"
            />
            <button
              onClick={saveEdit}
              className="profile-name-submit-btn">
              ✓
            </button>
          </div>
        ) : (
          <h2
            className="profile-username-title cursor-pointer select-none"
            onClick={() => {
              setInputValue(username); // ИСПРАВЛЕНО
              setIsEditing(true);
            }}>
            {username} {/* ИСПРАВЛЕНО */}
          </h2>
        )}

        <button
          onClick={onAddPetClick}
          className="profile-action-btn">
          Добавить питомца
        </button>
        <div
          className="profile-back-link"
          onClick={onClose}>
          Вернуться назад
        </div>
      </div>
    </div>
  );
};
