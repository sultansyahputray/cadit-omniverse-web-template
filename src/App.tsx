// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { useOmniverseBridge } from '@/core/hooks/useOmniverseBridge';
import { WebRTCViewerContainer } from '@/core/components/WebRTCViewerContainer';
import { LevelSelector } from '@/core/components/LevelSelector';
import { LevelRouter } from '@/core/router/LevelRouter';
import './index.css';

export const App: React.FC = () => {
  const bridge = useOmniverseBridge();

  return (
    <div className="cadit-app-root">
      {/* 1. Underlying WebRTC Video Stream Layer (100% matched with web-complete-data-centre) */}
      <WebRTCViewerContainer
        server="127.0.0.1"
        signalingPort={49100}
        isInteractive={true}
        onStreamStarted={() => {
          console.log('[WebRTC] Omniverse Stream connected successfully!');
        }}
      />

      {/* 2. 3D-to-2D Projection & Minimal Clean UI Layer */}
      <div className="cadit-viewport-overlay">
        {/* Minimal Interactive Level Transition Dropdown Selector */}
        <LevelSelector
          activeLevel={bridge.activeLevel}
          registeredLevels={bridge.registeredLevels}
          isConnected={bridge.isConnected}
          onSelectLevel={(levelId) => bridge.navigateTo(levelId)}
        />

        {/* Dynamic Multi-Level Content Router */}
        <LevelRouter
          activeLevel={bridge.activeLevel}
          telemetry={bridge.levelTelemetry}
          projections={bridge.projections}
          isConnected={bridge.isConnected}
          sendTelemetry={bridge.sendTelemetry}
          navigateTo={bridge.navigateTo}
          setPrimColor={bridge.setPrimColor}
          restorePrimColor={bridge.restorePrimColor}
          selectPrim={bridge.selectPrim}
          setCameraView={bridge.setCameraView}
        />
      </div>
    </div>
  );
};

export default App;
