// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LevelViewProps } from '@/core/types/level';
import { CoordinateAnchor } from '@/core/components/CoordinateAnchor';
import { Level01Telemetry } from './types';
import { OverviewStatsCard } from './components/OverviewStatsCard';
import './level01.css';

export const Level01DefaultView: React.FC<LevelViewProps<Level01Telemetry>> = ({
  telemetry,
  projections,
  setPrimColor,
  restorePrimColor,
  selectPrim
}) => {
  const handleHighlight = () => {
    // Highlight prim with neon cyan and emissive glow
    setPrimColor('/World', [0.0, 0.9, 1.0], true, 4000.0, true, 1.5);
  };

  const handleResetHighlight = () => {
    restorePrimColor('/World');
  };

  return (
    <div className="level01-view-root">
      {/* 1. Dedicated Level Sub-component */}
      <OverviewStatsCard
        telemetry={telemetry}
        onHighlightFacility={handleHighlight}
        onResetHighlight={handleResetHighlight}
      />

      {/* 2. Projected 3D-to-2D Coordinate Anchors */}
      {Object.entries(projections).map(([key, pos]) => {
        // If projection includes width, enable perspective zoom scaling automatically
        const hasWidth = pos.width != null && pos.width > 0;

        return (
          <CoordinateAnchor
            key={key}
            x={pos.x}
            y={pos.y}
            visible={pos.visible}
            widthPct={pos.width}
            enableZoomScale={hasWidth}
            baseWidth={6.0}
            anchorOrigin="bottom-center"
            offsetY={-12}
          >
            <div
              className="level01-anchor-card"
              onClick={() => selectPrim(key)}
              title={`Click to select ${key} in USD stage`}
            >
              <div className="anchor-card-header">
                <span className="anchor-card-tag">{key}</span>
                {hasWidth && (
                  <span style={{ fontSize: '9px', color: '#8b949e' }}>
                    {pos.width?.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="anchor-card-body">
                ONLINE
              </div>
            </div>
          </CoordinateAnchor>
        );
      })}
    </div>
  );
};

export default Level01DefaultView;
