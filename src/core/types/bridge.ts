// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * Omniverse Bridge Core Types:
 * Defines telemetry schemas, connection state, projection models, and command payloads.
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ScreenPosition {
  x: number;            // 0.0% to 100.0% from left
  y: number;            // 0.0% to 100.0% from top
  width?: number;       // Projected bounding box width in % (for dynamic zoom scaling)
  depth?: number;       // Camera depth distance
  visible?: boolean;    // True if in front of camera and within viewport (+ buffer margin)
}

export interface TelemetryPayload<T = Record<string, any>> {
  status: 'ok' | 'error';
  timestamp: number;
  active_level: string;
  system: {
    fps: number;
    selected_prim: string | null;
    camera: {
      path: string;
      position?: [number, number, number];
      rotation?: [number, number, number];
    };
    registered_levels: Array<{
      level_id: string;
      display_name: string;
      is_active: boolean;
    }>;
  };
  level_telemetry: T;
  projections: Record<string, ScreenPosition>;
}

export interface CommandResponse {
  status: 'ok' | 'error';
  command?: string;
  message?: string;
  error?: string;
  active_level?: string;
}
