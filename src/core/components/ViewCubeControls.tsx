// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import './ViewCubeControls.css';

export interface ViewCubeControlsProps {
  onSetCameraView: (viewName: string) => void;
}

export const ViewCubeControls: React.FC<ViewCubeControlsProps> = ({ onSetCameraView }) => {
  return (
    <div className="cadit-viewcube-container">
      <div className="viewcube-title">CAMERA</div>
      <div className="viewcube-grid">
        <button
          className="viewcube-btn iso"
          onClick={() => onSetCameraView('iso')}
          title="Isometric View"
        >
          ISO
        </button>
        <button
          className="viewcube-btn top"
          onClick={() => onSetCameraView('top')}
          title="Top View"
        >
          TOP
        </button>
        <button
          className="viewcube-btn front"
          onClick={() => onSetCameraView('front')}
          title="Front View"
        >
          FRONT
        </button>
        <button
          className="viewcube-btn side"
          onClick={() => onSetCameraView('right')}
          title="Side View"
        >
          SIDE
        </button>
      </div>
    </div>
  );
};
