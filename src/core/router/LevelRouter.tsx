// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LEVEL_REGISTRY } from './levelRegistry';
import { LevelViewProps } from '../types/level';

import { CoordinateAnchor } from '../components/CoordinateAnchor';

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
    // Dynamic Fallback: Clean 3D projection anchors for levels registered in Kit but without custom views
    return (
      <div className="cadit-generic-level-root">
        {Object.entries(projections).map(([key, pos]) => (
          <CoordinateAnchor
            key={key}
            x={pos.x}
            y={pos.y}
            visible={pos.visible}
            widthPct={pos.width}
            enableZoomScale={pos.width != null}
          >
            <div
              style={{
                minWidth: '110px',
                padding: '6px 10px',
                background: 'rgba(13, 17, 23, 0.88)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onClick={() => selectPrim(key)}
              title={`Click to select ${key} in USD stage`}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#00e5ff' }}>
                {key}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#f0f6fc', marginTop: '2px' }}>
                ONLINE
              </div>
            </div>
          </CoordinateAnchor>
        ))}
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
