// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import { ScreenPosition } from './bridge';

/**
 * Generic Props Contract for all Level Views:
 * T is the type-safe contract defined in each level's types.ts
 */
export interface LevelViewProps<T = Record<string, any>> {
  /** Level-specific telemetry data received from Omniverse */
  telemetry: T;

  /** 2D screen positions projected from 3D USD prims */
  projections: Record<string, ScreenPosition>;

  /** Whether REST/WebRTC bridge is currently connected */
  isConnected: boolean;

  /** Send custom telemetry/parameters back to the active level handler in Omniverse */
  sendTelemetry: (levelId: string, data: Record<string, any>) => Promise<boolean>;

  /** Request Omniverse LevelManager to switch to another level */
  navigateTo: (levelId: string, itemId?: string, extra?: Record<string, any>) => Promise<boolean>;

  /** Set custom display color, emissive glow, and flow pulse for a USD prim */
  setPrimColor: (
    primPath: string,
    color: [number, number, number],
    glow?: boolean,
    glowIntensity?: number,
    pulse?: boolean,
    pulseSpeed?: number
  ) => Promise<boolean>;

  /** Restore the original material color of a USD prim */
  restorePrimColor: (primPath: string) => Promise<boolean>;

  /** Set programmatic viewport single selection */
  selectPrim: (primPath: string | null) => Promise<boolean>;

  /** Change camera preset view with built-in smooth glide */
  setCameraView: (viewName: string, distance?: number, smooth?: boolean) => Promise<boolean>;
}
