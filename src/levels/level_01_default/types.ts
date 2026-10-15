// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * Telemetry Contract for Level 1 (Default Overview):
 * Synchronized with Level01DefaultHandler in Omniverse Kit.
 */

export interface Level01Telemetry {
  facility_name?: string;
  total_machines?: number;
  operational_status?: 'normal' | 'warning' | 'critical';
  avg_temperature?: number;
  total_power_kw?: number;
  active_alerts_count?: number;
  notes?: string;
}
