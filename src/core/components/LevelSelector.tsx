// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * LevelSelector:
 * Clean, interactive dropdown component for switching between Omniverse levels.
 * Serves as the primary reference implementation for commanding level transitions.
 */

import React, { useState, useRef, useEffect } from 'react';
import './LevelSelector.css';

export interface LevelItem {
  level_id: string;
  display_name: string;
  is_active: boolean;
}

export interface LevelSelectorProps {
  activeLevel: string;
  registeredLevels: LevelItem[];
  isConnected: boolean;
  onSelectLevel: (levelId: string) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  activeLevel,
  registeredLevels,
  isConnected,
  onSelectLevel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentLevel = registeredLevels.find(l => l.level_id === activeLevel);
  const displayName = currentLevel?.display_name || activeLevel;

  return (
    <div className="cadit-level-selector" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`selector-trigger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Klik untuk memilih level Omniverse"
      >
        <span
          className={`status-dot ${isConnected ? 'online' : 'offline'}`}
          title={isConnected ? 'Terhubung ke Omniverse Daemon' : 'Mencari Omniverse Daemon'}
        />
        <span className="selector-title">LEVEL:</span>
        <span className="selector-active-name">{displayName}</span>
        <span className="selector-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="selector-dropdown-menu" role="listbox">
          <div className="dropdown-menu-caption">
            AVAILABLE LEVELS ({registeredLevels.length})
          </div>
          <div className="dropdown-menu-list">
            {registeredLevels.map((lvl, index) => {
              const isSelected = lvl.level_id === activeLevel;
              const formattedIndex = String(index + 1).padStart(2, '0');

              return (
                <button
                  key={lvl.level_id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectLevel(lvl.level_id);
                    setIsOpen(false);
                  }}
                  title={`Perintah pindah ke level: ${lvl.level_id}`}
                >
                  <span className="item-index">{formattedIndex}</span>
                  <div className="item-details">
                    <span className="item-name">{lvl.display_name}</span>
                    <span className="item-id">{lvl.level_id}</span>
                  </div>
                  {isSelected && <span className="item-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;
