// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import './HUDHeader.css';

export interface HUDHeaderProps {
  title?: string;
  activeLevel: string;
  registeredLevels: Array<{ level_id: string; display_name: string; is_active: boolean }>;
  isConnected: boolean;
  currentPort: number;
  fps: number;
  selectedPrim: string | null;
  onSelectLevel: (levelId: string) => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  title = 'CADIT OMNIVERSE DIGITAL TWIN',
  activeLevel,
  registeredLevels,
  isConnected,
  currentPort,
  fps,
  selectedPrim,
  onSelectLevel
}) => {
  return (
    <header className="cadit-hud-header">
      {/* Left: Branding & Connection Status */}
      <div className="cadit-hud-left">
        <div className="cadit-brand-title">{title}</div>
        <div className="cadit-status-pill">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span className="status-label">
            {isConnected ? `CONNECTED :${currentPort}` : 'SEARCHING DAEMON'}
          </span>
          {isConnected && <span className="status-fps">{fps} FPS</span>}
        </div>
      </div>

      {/* Center: Dynamic Level Breadcrumb Navigation Bar */}
      <div className="cadit-hud-center">
        <nav className="level-breadcrumbs-nav" aria-label="Level Navigation Breadcrumbs">
          <div className="level-count-badge" title={`${registeredLevels.length} level terdeteksi di ekstensi Omniverse`}>
            <span className="count-num">{registeredLevels.length}</span>
            <span className="count-label">{registeredLevels.length === 1 ? 'LEVEL' : 'LEVELS'}</span>
          </div>

          <div className="breadcrumbs-list">
            {registeredLevels.map((lvl, index) => {
              const isActive = lvl.level_id === activeLevel;
              const formattedIndex = String(index + 1).padStart(2, '0');

              return (
                <React.Fragment key={lvl.level_id}>
                  {index > 0 && <span className="breadcrumb-separator">/</span>}
                  <button
                    type="button"
                    className={`breadcrumb-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectLevel(lvl.level_id)}
                    title={`Pindah ke ${lvl.display_name} (${lvl.level_id})`}
                  >
                    <span className="breadcrumb-index">{formattedIndex}</span>
                    <span className="breadcrumb-name">{lvl.display_name}</span>
                    {isActive && <span className="breadcrumb-active-dot" />}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Right: Selected USD Prim Breadcrumb */}
      <div className="cadit-hud-right">
        {selectedPrim ? (
          <div className="selected-prim-badge">
            <span className="badge-prefix">PRIM:</span>
            <span className="badge-path" title={selectedPrim}>
              {selectedPrim.split('/').pop() || selectedPrim}
            </span>
          </div>
        ) : (
          <div className="no-selection-badge">NO SELECTION</div>
        )}
      </div>
    </header>
  );
};
