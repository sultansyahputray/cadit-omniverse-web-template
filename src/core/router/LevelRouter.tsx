// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LEVEL_REGISTRY } from './levelRegistry';
import { LevelViewProps } from '../types/level';

export interface LevelRouterProps extends LevelViewProps<any> {
  activeLevel: string;
}

export const LevelRouter: React.FC<LevelRouterProps> = ({
  activeLevel,
  telemetry,
  projections,
  isConnected,
  sendTelemetry,
  navigateTo,
  setPrimColor,
  restorePrimColor,
  selectPrim,
  setCameraView
}) => {
  const ActiveComponent = LEVEL_REGISTRY[activeLevel];

  if (!ActiveComponent) {
    return (
      <div
        className="cadit-glass-panel"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          padding: '16px 20px',
          color: '#f0f6fc',
          fontFamily: 'Inter, -apple-system, sans-serif',
          zIndex: 30,
          maxWidth: '360px'
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffb020', marginBottom: '6px' }}>
          LEVEL VIEW NOT FOUND
        </div>
        <div style={{ fontSize: '12px', color: '#8b949e', lineHeight: 1.4 }}>
          No React view is registered for level <code style={{ color: '#00e5ff' }}>{activeLevel}</code>.
          Run <code style={{ color: '#00e5ff' }}>add_web_level.bat {activeLevel}</code> to generate it automatically.
        </div>
      </div>
    );
  }

  return (
    <ActiveComponent
      telemetry={telemetry}
      projections={projections}
      isConnected={isConnected}
      sendTelemetry={sendTelemetry}
      navigateTo={navigateTo}
      setPrimColor={setPrimColor}
      restorePrimColor={restorePrimColor}
      selectPrim={selectPrim}
      setCameraView={setCameraView}
    />
  );
};
