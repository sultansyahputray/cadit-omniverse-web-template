// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * Telemetry Contract for level_02_room:
 * Synchronized with Omniverse Kit level handler.
 */

export interface Level02RoomTelemetry {
  status?: string;
  temperature?: number;
  metric_value?: number;
  [key: string]: any;
}
