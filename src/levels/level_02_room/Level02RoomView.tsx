// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LevelViewProps } from '@/core/types/level';
import { CoordinateAnchor } from '@/core/components/CoordinateAnchor';
import { Button } from '@/reusable';
import { Level02RoomTelemetry } from './types';
import './level_02_room.css';

export const Level02RoomView: React.FC<LevelViewProps<Level02RoomTelemetry>> = ({
  telemetry,
  projections,
  setPrimColor,
  restorePrimColor,
  selectPrim
}) => {
  return (
    <div className="level_02_room-view-root">
      {/* Level HUD Card */}
      <div className="cadit-glass-panel level_02_room-hud-card">
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#00e5ff' }}>
          LEVEL02ROOM DASHBOARD
        </h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#8b949e' }}>
          Status: <strong style={{ color: '#f0f6fc' }}>{telemetry.status || 'Active'}</strong>
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setPrimColor('/World', [0, 0.9, 1], true)}
        >
          HIGHLIGHT LEVEL
        </Button>
      </div>

      {/* Pinned 3D Anchors */}
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
              padding: '6px 10px',
              background: 'rgba(13, 17, 23, 0.9)',
              border: '1px solid #00e5ff',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#f0f6fc',
              cursor: 'pointer'
            }}
            onClick={() => selectPrim(key)}
          >
            {key}
          </div>
        </CoordinateAnchor>
      ))}
    </div>
  );
};

export default Level02RoomView;
