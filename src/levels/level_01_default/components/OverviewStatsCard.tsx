// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { Button } from '@/reusable';
import { Level01Telemetry } from '../types';

export interface OverviewStatsCardProps {
  telemetry: Level01Telemetry;
  onHighlightFacility: () => void;
  onResetHighlight: () => void;
}

export const OverviewStatsCard: React.FC<OverviewStatsCardProps> = ({
  telemetry,
  onHighlightFacility,
  onResetHighlight
}) => {
  const status = telemetry.operational_status || 'normal';

  return (
    <div className="cadit-glass-panel level01-hud-panel">
      <div className="level01-title-row">
        <span className="level01-title">{telemetry.facility_name || 'FACILITY OVERVIEW'}</span>
        <span className={`level01-status-badge ${status}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="level01-metrics-grid">
        <div className="level01-metric-box">
          <div className="level01-metric-label">Avg Temp</div>
          <div className="level01-metric-value">
            {telemetry.avg_temperature ?? 24.5}
            <span className="level01-unit">°C</span>
          </div>
        </div>

        <div className="level01-metric-box">
          <div className="level01-metric-label">Power Draw</div>
          <div className="level01-metric-value">
            {telemetry.total_power_kw ?? 142.8}
            <span className="level01-unit">kW</span>
          </div>
        </div>

        <div className="level01-metric-box">
          <div className="level01-metric-label">Machines</div>
          <div className="level01-metric-value">
            {telemetry.total_machines ?? 12}
            <span className="level01-unit">units</span>
          </div>
        </div>

        <div className="level01-metric-box">
          <div className="level01-metric-label">Open Alerts</div>
          <div className="level01-metric-value" style={{ color: (telemetry.active_alerts_count || 0) > 0 ? '#ff7b72' : '#3fb950' }}>
            {telemetry.active_alerts_count ?? 0}
          </div>
        </div>
      </div>

      <div className="level01-actions">
        <Button variant="primary" size="sm" onClick={onHighlightFacility} style={{ flex: 1 }}>
          HIGHLIGHT PRIM
        </Button>
        <Button variant="secondary" size="sm" onClick={onResetHighlight}>
          RESET
        </Button>
      </div>
    </div>
  );
};
