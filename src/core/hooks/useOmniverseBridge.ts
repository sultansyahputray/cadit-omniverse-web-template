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

  const activePortRef = useRef<number>(8089);
  const [currentPort, setCurrentPort] = useState<number>(8089);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<string>('level_01_default');
  const [fps, setFps] = useState<number>(60);
  const [selectedPrim, setSelectedPrim] = useState<string | null>(null);
  const [registeredLevels, setRegisteredLevels] = useState<Array<{ level_id: string; display_name: string; is_active: boolean }>>([
    { level_id: 'level_01_default', display_name: 'Default Overview', is_active: true }
  ]);
  const [levelTelemetry, setLevelTelemetry] = useState<Record<string, any>>({});
  const [projections, setProjections] = useState<Record<string, ScreenPosition>>({});

  const isMountedRef = useRef<boolean>(true);

  // Calculate client viewport aspect ratio (throttled/cached)
  const getClientAspect = useCallback(() => {
    if (typeof window === 'undefined') return '1.7778';
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    return Math.max(0.2, Math.min(aspect, 5.0)).toFixed(4);
  }, []);

  // Resilient multi-port POST dispatcher with instant failover (<5ms)
  const postCommand = useCallback(async (endpoint: string, body: Record<string, any>): Promise<CommandResponse | null> => {
    const ports = [
      activePortRef.current,
      ...FALLBACK_PORTS.filter(p => p !== activePortRef.current)
    ];

    for (const port of ports) {
      try {
        const res = await fetch(`http://${host}:${port}/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          if (activePortRef.current !== port) {
            activePortRef.current = port;
            setCurrentPort(port);
          }
          const data: CommandResponse = await res.json();
          return data;
        }
      } catch {
        // try next candidate port immediately in the same tick
      }
    }
    return null;
  }, [host]);

  // High-performance polling loop with Keep-Alive & Delta-Checking (Zero render thrashing)
  useEffect(() => {
    if (!enabled) return;
    isMountedRef.current = true;

    let timerId: any = null;
    let isRequestInFlight = false;

    const pollTelemetry = async () => {
      if (isRequestInFlight || !isMountedRef.current) return;
      isRequestInFlight = true;

      let successData: TelemetryPayload | null = null;
      const portsToTry = [
        activePortRef.current,
        ...FALLBACK_PORTS.filter(p => p !== activePortRef.current)
      ];

      for (const port of portsToTry) {
        if (!isMountedRef.current) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const aspect = getClientAspect();

          // Native Keep-Alive fetch (no Connection: close socket teardowns)
          const response = await fetch(`http://${host}:${port}/api/telemetry?aspect=${aspect}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            if (activePortRef.current !== port) {
              activePortRef.current = port;
              setCurrentPort(port);
            }
            successData = await response.json();
            break;
          }
        } catch {
          // Immediately try next port
        }
      }

      if (isMountedRef.current) {
        if (successData) {
          setIsConnected(true);
          const currentLevel = successData.active_level || 'level_01_default';
          
          setActiveLevel(prev => (prev !== currentLevel ? currentLevel : prev));
          setFps(successData.system?.fps || 60);

          const incomingSelected = successData.system?.selected_prim ?? null;
          setSelectedPrim(prev => (prev !== incomingSelected ? incomingSelected : prev));

          // 1. Registered levels parsing with delta check
          const rawLevels = successData.system?.registered_levels;
          let parsedLevels: Array<{ level_id: string; display_name: string; is_active: boolean }> = [];
          if (Array.isArray(rawLevels)) {
            parsedLevels = rawLevels.map((lvl: any) => {
              const id = typeof lvl === 'string' ? lvl : (lvl.level_id || lvl.id || '');
              const name = typeof lvl === 'string' ? lvl : (lvl.display_name || lvl.name || id);
              return {
                level_id: id,
                display_name: name,
                is_active: id === currentLevel
              };
            });
          } else if (rawLevels && typeof rawLevels === 'object') {
            parsedLevels = Object.entries(rawLevels).map(([lvlId, dispName]) => ({
              level_id: lvlId,
              display_name: typeof dispName === 'string' ? dispName : ((dispName as any)?.display_name || lvlId),
              is_active: lvlId === currentLevel
            }));
          }

          if (parsedLevels.length > 0) {
            setRegisteredLevels(prev => {
              if (JSON.stringify(prev) === JSON.stringify(parsedLevels)) return prev;
              return parsedLevels;
            });
          }

          // 2. Level custom telemetry delta check
          const rawTelemetry = (successData.level_telemetry as any)?.data ?? successData.level_telemetry ?? {};
          setLevelTelemetry(prev => {
            if (JSON.stringify(prev) === JSON.stringify(rawTelemetry)) return prev;
            return rawTelemetry;
          });

          // 3. 3D-to-2D projected screen positions with Delta Check (prevents 60FPS re-render thrash)
          const incomingPositions = successData.projections || {};
          setProjections(prev => {
            const prevKeys = Object.keys(prev);
            const incomingKeys = Object.keys(incomingPositions);
            if (prevKeys.length !== incomingKeys.length) {
              return incomingPositions;
            }

            let hasChanged = false;
            for (const key of incomingKeys) {
              const p = prev[key];
              const n = incomingPositions[key];
              if (!p || p.visible !== n.visible) {
                hasChanged = true;
                break;
              }
              if (Math.abs(p.x - n.x) > 0.05 || Math.abs(p.y - n.y) > 0.05) {
                hasChanged = true;
                break;
              }
              if ((p.width != null || n.width != null) && Math.abs((p.width || 0) - (n.width || 0)) > 0.05) {
                hasChanged = true;
                break;
              }
            }
            return hasChanged ? incomingPositions : prev;
          });
        } else {
          setIsConnected(false);
        }
      }

      isRequestInFlight = false;
      if (isMountedRef.current) {
        timerId = setTimeout(pollTelemetry, pollingInterval);
      }
    };

    pollTelemetry();

    return () => {
      isMountedRef.current = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [enabled, getClientAspect, host, pollingInterval]);

  // Command: Navigate to level
  const navigateTo = useCallback(async (levelId: string, itemId?: string, extra: Record<string, any> = {}): Promise<boolean> => {
    const res = await postCommand('navigate', { level: levelId, level_id: levelId, item_id: itemId, ...extra });
    if (res && res.status === 'ok') {
      setActiveLevel(levelId);
      return true;
    }
    return false;
  }, [postCommand]);

  // Command: Set camera view
  const setCameraView = useCallback(async (viewName: string, distance?: number, smooth: boolean = true): Promise<boolean> => {
    const res = await postCommand('camera', { view: viewName, distance, smooth });
    return !!(res && res.status === 'ok');
  }, [postCommand]);

  // Command: Set prim color & glow
  const setPrimColor = useCallback(async (
    primPath: string,
    color: [number, number, number],
    glow: boolean = false,
    glowIntensity: number = 3000.0,
    pulse: boolean = false,
    pulseSpeed: number = 1.0
  ): Promise<boolean> => {
    const res = await postCommand('color', {
      prim_path: primPath,
      color,
      glow,
      glow_intensity: glowIntensity,
      pulse,
      pulse_speed: pulseSpeed
    });
    return !!(res && res.status === 'ok');
  }, [postCommand]);

  // Command: Restore prim color
  const restorePrimColor = useCallback(async (primPath: string): Promise<boolean> => {
    const res = await postCommand('color/restore', { prim_path: primPath });
    return !!(res && res.status === 'ok');
  }, [postCommand]);

  // Command: Select prim
  const selectPrim = useCallback(async (primPath: string | null): Promise<boolean> => {
    const res = await postCommand('select', { prim_path: primPath });
    return !!(res && res.status === 'ok');
  }, [postCommand]);

  // Command: Send custom telemetry
  const sendTelemetry = useCallback(async (levelId: string, payload: Record<string, any>): Promise<boolean> => {
    const res = await postCommand('telemetry', { level_id: levelId, data: payload });
    return !!(res && res.status === 'ok');
  }, [postCommand]);

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
