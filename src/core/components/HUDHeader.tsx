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

      {/* Center: Level Breadcrumbs / Selector Tabs */}
      <div className="cadit-hud-center">
        <div className="level-tabs-container">
          {registeredLevels.length > 0 ? (
            registeredLevels.map(lvl => (
              <button
                key={lvl.level_id}
                className={`level-tab-btn ${lvl.level_id === activeLevel ? 'active' : ''}`}
                onClick={() => onSelectLevel(lvl.level_id)}
                title={`Switch to ${lvl.display_name}`}
              >
                {lvl.display_name}
              </button>
            ))
          ) : (
            <div className="level-tab-single active">
              LEVEL: {activeLevel}
            </div>
          )}
        </div>
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
