// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import { useState, useEffect, useRef, useCallback } from 'react';
import { TelemetryPayload, ScreenPosition, CommandResponse } from '../types/bridge';

const FALLBACK_PORTS = [8089, 8088, 8090, 8091];
const POLLING_INTERVAL_MS = 150;

export interface UseOmniverseBridgeOptions {
  host?: string;
  pollingInterval?: number;
  enabled?: boolean;
}

export function useOmniverseBridge(options: UseOmniverseBridgeOptions = {}) {
  const { host = '127.0.0.1', pollingInterval = POLLING_INTERVAL_MS, enabled = true } = options;

  const [activePortIndex, setActivePortIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>('level_01_default');
  const [fps, setFps] = useState<number>(60);
  const [selectedPrim, setSelectedPrim] = useState<string | null>(null);
  const [registeredLevels, setRegisteredLevels] = useState<Array<{ level_id: string; display_name: string; is_active: boolean }>>([]);
  const [levelTelemetry, setLevelTelemetry] = useState<Record<string, any>>({});
  const [projections, setProjections] = useState<Record<string, ScreenPosition>>({});

  const isMountedRef = useRef(true);
  const currentPort = FALLBACK_PORTS[activePortIndex];
  const baseUrl = `http://${host}:${currentPort}`;

  // Calculate client viewport aspect ratio
  const getClientAspect = useCallback(() => {
    if (typeof window === 'undefined') return 16.0 / 9.0;
    const aspect = window.innerWidth / (window.innerHeight || 1);
    return Math.max(0.2, Math.min(aspect, 5.0)).toFixed(4);
  }, []);

  // Polling loop
  useEffect(() => {
    if (!enabled) return;
    isMountedRef.current = true;

    let timerId: any = null;
    let consecutiveFailures = 0;
    let isRequestInFlight = false;
    let currentAbortController: AbortController | null = null;

    const pollTelemetry = async () => {
      if (isRequestInFlight || !isMountedRef.current) return;
      isRequestInFlight = true;

      try {
        currentAbortController = new AbortController();
        const timeoutId = setTimeout(() => currentAbortController?.abort(), 3000);

        const aspect = getClientAspect();
        const response = await fetch(`${baseUrl}/api/telemetry?aspect=${aspect}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Connection': 'close'
          },
          signal: currentAbortController.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data: TelemetryPayload = await response.json();

        if (isMountedRef.current) {
          consecutiveFailures = 0;
          setIsConnected(true);
          setActiveLevel(data.active_level || 'level_01_default');
          setFps(data.system?.fps || 60);
          setSelectedPrim(data.system?.selected_prim ?? null);
          setRegisteredLevels(data.system?.registered_levels || []);
          const rawTelemetry = (data.level_telemetry as any)?.data ?? data.level_telemetry ?? {};
          setLevelTelemetry(rawTelemetry);
          setProjections(data.projections || {});
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        consecutiveFailures++;

        if (consecutiveFailures >= 3) {
          setIsConnected(false);
          // Rotate to next candidate port
          setActivePortIndex(prev => (prev + 1) % FALLBACK_PORTS.length);
          consecutiveFailures = 0;
        }
      } finally {
        isRequestInFlight = false;
        if (isMountedRef.current) {
          timerId = setTimeout(pollTelemetry, pollingInterval);
        }
      }
    };

    pollTelemetry();

    return () => {
      isMountedRef.current = false;
      if (timerId) clearTimeout(timerId);
      if (currentAbortController) currentAbortController.abort();
    };
  }, [baseUrl, enabled, getClientAspect, pollingInterval]);

  // Command: Navigate to level
  const navigateTo = useCallback(async (levelId: string, itemId?: string, extra: Record<string, any> = {}): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: levelId, item_id: itemId, ...extra })
      });
      const data: CommandResponse = await response.json();
      if (data.status === 'ok') {
        setActiveLevel(levelId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [baseUrl]);

  // Command: Set camera view
  const setCameraView = useCallback(async (viewName: string, distance?: number, smooth: boolean = true): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view: viewName, distance, smooth })
      });
      const data: CommandResponse = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }, [baseUrl]);

  // Command: Set prim color & glow
  const setPrimColor = useCallback(async (
    primPath: string,
    color: [number, number, number],
    glow: boolean = false,
    glowIntensity: number = 3000.0,
    pulse: boolean = false,
    pulseSpeed: number = 1.0
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prim_path: primPath,
          color,
          glow,
          glow_intensity: glowIntensity,
          pulse,
          pulse_speed: pulseSpeed
        })
      });
      const data: CommandResponse = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }, [baseUrl]);

  // Command: Restore prim color
  const restorePrimColor = useCallback(async (primPath: string): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/color/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prim_path: primPath })
      });
      const data: CommandResponse = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }, [baseUrl]);

  // Command: Select prim
  const selectPrim = useCallback(async (primPath: string | null): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prim_path: primPath })
      });
      const data: CommandResponse = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }, [baseUrl]);

  // Command: Send custom telemetry
  const sendTelemetry = useCallback(async (levelId: string, payload: Record<string, any>): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: levelId, data: payload })
      });
      const data: CommandResponse = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }, [baseUrl]);

  return {
    isConnected,
    currentPort,
    activeLevel,
    fps,
    selectedPrim,
    registeredLevels,
    levelTelemetry,
    projections,
    navigateTo,
    setCameraView,
    setPrimColor,
    restorePrimColor,
    selectPrim,
    sendTelemetry
  };
}
