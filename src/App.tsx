// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { useOmniverseBridge } from '@/core/hooks/useOmniverseBridge';
import { WebRTCViewerContainer } from '@/core/components/WebRTCViewerContainer';
import { HUDHeader } from '@/core/components/HUDHeader';
import { ViewCubeControls } from '@/core/components/ViewCubeControls';
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

      {/* 2. 3D-to-2D Projection & UI Overlay Layer */}
      <div className="cadit-viewport-overlay">
        {/* Top Navigation & Status Header */}
        <HUDHeader
          title="CADIT DIGITAL TWIN"
          activeLevel={bridge.activeLevel}
          registeredLevels={bridge.registeredLevels}
          isConnected={bridge.isConnected}
          currentPort={bridge.currentPort}
          fps={bridge.fps}
          selectedPrim={bridge.selectedPrim}
          onSelectLevel={(levelId) => bridge.navigateTo(levelId)}
        />

        {/* Quick Camera Preset Controls */}
        <ViewCubeControls onSetCameraView={(viewName) => bridge.setCameraView(viewName, undefined, true)} />

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
