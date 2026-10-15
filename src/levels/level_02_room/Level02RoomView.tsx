// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LevelViewProps } from '@/core/types/level';
import { CoordinateAnchor } from '@/core/components/CoordinateAnchor';
import { Level02RoomTelemetry } from './types';

export const Level02RoomView: React.FC<LevelViewProps<Level02RoomTelemetry>> = ({
  projections,
  selectPrim
}) => {
  return (
    <div className="level_02_room-view-root">
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
