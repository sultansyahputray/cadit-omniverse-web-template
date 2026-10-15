# CADIT Omniverse Web Template

Enterprise-grade starter template and digital twin dashboard framework for NVIDIA Omniverse Kit SDK applications. Built with React 18, Vite, and TypeScript.

---

## 1. Overview

`cadit-omniverse-web-template` is designed to pair seamlessly with `cadit-omniverse-helper` on the Omniverse Kit side. It provides:
* **Clean WebRTC Stream Container**: Stripped of NVIDIA sample bloat, mock demo forms, and test widgets.
* **Resilient Bridge (`useOmniverseBridge`)**: Auto-fallback port polling (`8089`, `8088`, `8090`), aspect ratio auto-sync (`?aspect=...`), and command dispatchers.
* **Diegetic 3D Projection (`<CoordinateAnchor>`)**:
  * Pinned 3D-to-2D coordinates (`left: x%`, `top: y%`).
  * Dynamic perspective zoom scaling (`enableZoomScale: true` driven by projected bounding box width).
  * Natural 3D sticker clipping at viewport edges without artificial detachment.
  * Optional smart screen clamping for critical HUD warnings.
* **Modular Per-Level Architecture**: Each level lives in its own dedicated folder (`src/levels/<level_id>/`) with its own `types.ts`, stylesheet, view, and local `components/` subfolder.
* **Central Reusable UI System**: Global primitives in `src/reusable/` with automatic barrel export.
* **Developer CLI Scaffolding**: Fast generation of levels (`add_web_level.bat`) and components (`add_component.bat`).

---

## 2. Directory Structure

```
cadit-omniverse-web-template/
├── .npmrc                              # Scoped NVIDIA Artifactory registry
├── stream.config.json                  # WebRTC streaming server configuration
├── add_web_level.bat                   # CLI shortcut to scaffold a new level
├── add_component.bat                   # CLI shortcut to scaffold a reusable component
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                        # Application mount
│   ├── App.tsx                         # Core layout (~45 lines)
│   ├── index.css                       # Dark enterprise theme and viewport lock
│   ├── core/
│   │   ├── hooks/
│   │   │   └── useOmniverseBridge.ts   # Polling, telemetry, & command dispatchers
│   │   ├── components/
│   │   │   ├── WebRTCViewerContainer.tsx # Fullscreen WebRTC livestream canvas
│   │   │   ├── AppStream.tsx             # Low-level NVIDIA WebRTC streamer
│   │   │   ├── LevelSelector.tsx         # Minimalist interactive level dropdown selector
│   │   │   ├── LevelSelector.css         # Level dropdown styling & glassmorphism
│   │   │   ├── CoordinateAnchor.tsx      # Pinned 3D-to-2D projection component
│   │   │   └── CoordinateAnchor.css      # Transform origins and transitions
│   │   ├── router/
│   │   │   ├── LevelRouter.tsx          # Dynamic resolver for active level
│   │   │   └── levelRegistry.ts         # Registered level mapping (auto-updated)
│   │   └── types/
│   │       ├── bridge.ts                # Telemetry schemas & connection models
│   │       └── level.ts                 # Generic LevelViewProps<T> contract
│   ├── levels/
│   │   ├── level_01_default/            # Default Level 1
│   │   │   ├── Level01DefaultView.tsx   # Level entry view with 3D anchors
│   │   │   ├── level01.css              # Level stylesheet
│   │   │   └── types.ts                 # Level telemetry TypeScript contract
│   │   └── level_02_room/               # Example multi-level folder
│   ├── reusable/                        # Global Reusable Components
│   │   ├── index.ts                     # Central barrel export
│   │   ├── Reusable.css                 # Glassmorphism design tokens & styles
│   │   ├── Button.tsx                   # Enterprise button component
│   │   └── StatusBadge.tsx
│   └── tools/
│       ├── scaffold_level.js           # Scaffolding engine for add_web_level
│       └── scaffold_component.js       # Scaffolding engine for add_component
```

---

## 3. Quick Start

### 3.1 Install Dependencies
Ensure `.npmrc` is present in the project root:
```bash
npm install
```

### 3.2 Configure Streaming Server
Check `stream.config.json` to match your Omniverse Kit streaming configuration:
```json
{
  "source": "local",
  "local": {
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  }
}
```

### 3.3 Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3.4 Build for Production
```bash
npm run build
```

---

## 4. Developer CLI Scaffolding

### 4.1 Adding a New Level
To add a new level view:
```cmd
.\add_web_level.bat level_03_rack
```
This automatically:
1. Creates folder `src/levels/level_03_rack/`.
2. Creates `src/levels/level_03_rack/types.ts` for typing your telemetry.
3. Creates `src/levels/level_03_rack/level_03_rack.css` for isolated styling.
4. Creates `src/levels/level_03_rack/Level03RackView.tsx` with boilerplate wire-up.
5. Creates subfolder `src/levels/level_03_rack/components/` for level-specific widgets.
6. Auto-registers `level_03_rack` inside `src/core/router/levelRegistry.ts`.

### 4.2 Adding a Reusable Component
To add a new shared UI component:
```cmd
.\add_component.bat CircularGauge
```
This automatically:
1. Creates `src/reusable/CircularGauge.tsx`.
2. Appends `export * from './CircularGauge';` to `src/reusable/index.ts`.
3. Enables immediate importing across any level: `import { CircularGauge } from '@/reusable';`.

---

## 5. Projection System (`<CoordinateAnchor>`)

The `<CoordinateAnchor>` component pins any HTML/React element to projected 3D world coordinates.

### 5.1 Simple Fixed-Size Pin (Only Tracks Position)
```tsx
<CoordinateAnchor x={pos.x} y={pos.y} visible={pos.visible}>
  <div className="simple-tag">Sensor A</div>
</CoordinateAnchor>
```

### 5.2 True 3D Sticker with Dynamic Perspective Zoom Scaling
```tsx
<CoordinateAnchor
  x={pos.x}
  y={pos.y}
  visible={pos.visible}
  widthPct={pos.width}
  enableZoomScale={true}
  baseWidth={6.0}
  minScale={0.3}
  maxScale={2.5}
  anchorOrigin="bottom-center"
>
  <div className="rack-card">Rack 01</div>
</CoordinateAnchor>
```
* **Zoom In**: As the camera approaches the object, `widthPct` increases and the card scales up proportionally.
* **Zoom Out**: As the camera pulls back, the card scales down.
* **Edge Cut-Off**: When the object moves off-screen, the card is naturally clipped by the viewport edge without detaching from the object.

### 5.3 Smart Screen Clamping (Emergency HUD Alert)
```tsx
<CoordinateAnchor x={pos.x} y={pos.y} clampToScreen={true}>
  <div className="alert-badge">OVERHEAT WARNING</div>
</CoordinateAnchor>
```

---

## 6. Communication & Commands (`useOmniverseBridge`)

Level views receive command dispatchers via props:

```tsx
export const MyLevelView: React.FC<LevelViewProps<MyTelemetry>> = ({
  telemetry,
  projections,
  setPrimColor,
  restorePrimColor,
  selectPrim,
  setCameraView,
  navigateTo,
  sendTelemetry
}) => {
  // 1. Highlight USD Prim with neon color and emissive glow
  const highlight = () => {
    setPrimColor('/World/Machine_01', [0, 0.9, 1], true, 4000.0, true);
  };

  // 2. Switch camera angle
  const viewTop = () => {
    setCameraView('top');
  };

  // 3. Navigate to sub-level
  const drillDown = () => {
    navigateTo('level_02_room');
  };

  return ( ... );
};
```
