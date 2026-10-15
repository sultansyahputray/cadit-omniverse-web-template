// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React, { useMemo } from 'react';
import './CoordinateAnchor.css';

export type AnchorOrigin =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center';

export interface CoordinateAnchorProps {
  /** Screen percentage X from left (0.0% to 100.0%) */
  x: number;

  /** Screen percentage Y from top (0.0% to 100.0%) */
  y: number;

  /** Visibility flag from Omniverse camera frustum */
  visible?: boolean;

  /** Projected bounding box width in % (for dynamic zoom scaling) */
  widthPct?: number;

  /** Whether to dynamically scale the card as the camera zooms in/out (default: false) */
  enableZoomScale?: boolean;

  /** Reference baseline width in % where card scale is 1.0 (default: 6.0) */
  baseWidth?: number;

  /** Minimum scaling clamp when zoomed out far (default: 0.3) */
  minScale?: number;

  /** Maximum scaling clamp when zoomed in close (default: 2.5) */
  maxScale?: number;

  /**
   * Screen clamping behavior:
   * false (default): Card stays strictly pinned to 3D object and cuts off naturally at viewport edge (true 3D sticker).
   * true: Card is constrained within viewport margins (e.g. 5% to 95%) for critical HUD warnings.
   */
  clampToScreen?: boolean;

  /** Transform alignment pivot */
  anchorOrigin?: AnchorOrigin;

  /** Additional horizontal pixel offset */
  offsetX?: number;

  /** Additional vertical pixel offset */
  offsetY?: number;

  /** Custom CSS classes */
  className?: string;

  /** Inline CSS overrides */
  style?: React.CSSProperties;

  /** Inner card content */
  children: React.ReactNode;
}

const ORIGIN_TRANSFORMS: Record<AnchorOrigin, { x: string; y: string; cssOrigin: string }> = {
  'top-left': { x: '0%', y: '0%', cssOrigin: 'top left' },
  'top-center': { x: '-50%', y: '0%', cssOrigin: 'top center' },
  'top-right': { x: '-100%', y: '0%', cssOrigin: 'top right' },
  'bottom-left': { x: '0%', y: '-100%', cssOrigin: 'bottom left' },
  'bottom-center': { x: '-50%', y: '-100%', cssOrigin: 'bottom center' },
  'bottom-right': { x: '-100%', y: '-100%', cssOrigin: 'bottom right' },
  'center': { x: '-50%', y: '-50%', cssOrigin: 'center center' }
};

export const CoordinateAnchor: React.FC<CoordinateAnchorProps> = ({
  x,
  y,
  visible = true,
  widthPct,
  enableZoomScale = false,
  baseWidth = 6.0,
  minScale = 0.3,
  maxScale = 2.5,
  clampToScreen = false,
  anchorOrigin = 'top-center',
  offsetX = 0,
  offsetY = 0,
  className = '',
  style = {},
  children
}) => {
  // 1. Behind camera / outside frustum visibility check
  if (!visible) {
    return null;
  }

  // 2. Position calculation (pure 3D sticker vs clamped HUD)
  const posX = clampToScreen ? Math.max(5, Math.min(x, 95)) : x;
  const posY = clampToScreen ? Math.max(5, Math.min(y, 95)) : y;

  // 3. Dynamic perspective zoom scale calculation
  const scale = useMemo(() => {
    if (!enableZoomScale || widthPct == null || widthPct <= 0) {
      return 1.0;
    }
    const computed = widthPct / (baseWidth > 0 ? baseWidth : 6.0);
    return Math.max(minScale, Math.min(computed, maxScale));
  }, [enableZoomScale, widthPct, baseWidth, minScale, maxScale]);

  // 4. Transform alignment
  const originDef = ORIGIN_TRANSFORMS[anchorOrigin] || ORIGIN_TRANSFORMS['top-center'];
  const transform = `translate(calc(${originDef.x} + ${offsetX}px), calc(${originDef.y} + ${offsetY}px)) scale(${scale})`;

  return (
    <div
      className={`cadit-coordinate-anchor ${className}`}
      style={{
        position: 'absolute',
        left: `${posX}%`,
        top: `${posY}%`,
        transform,
        transformOrigin: originDef.cssOrigin,
        pointerEvents: 'auto',
        ...style
      }}
    >
      {children}
    </div>
  );
};
