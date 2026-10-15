// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * CLI Generator for Adding New Modular Web Levels:
 * Generates folder structure, types.ts, css, main view, components folder,
 * and auto-registers the level inside levelRegistry.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawLevelArg = process.argv[2];

if (!rawLevelArg) {
  console.error('\nUsage: node tools/scaffold_level.js <level_id>');
  console.error('Example: node tools/scaffold_level.js level_02_room\n');
  process.exit(1);
}

const levelId = rawLevelArg.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

// Convert level_02_room -> Level02Room
const pascalName = levelId
  .split('_')
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const viewName = `${pascalName}View`;
const levelDir = path.join(rootDir, 'src', 'levels', levelId);
const componentsDir = path.join(levelDir, 'components');
const typesFile = path.join(levelDir, 'types.ts');
const cssFile = path.join(levelDir, `${levelId}.css`);
const viewFile = path.join(levelDir, `${viewName}.tsx`);
const registryFile = path.join(rootDir, 'src', 'core', 'router', 'levelRegistry.ts');

console.log(`\n===========================================================================`);
console.log(`  SCAFFOLDING NEW LEVEL: ${levelId}`);
console.log(`===========================================================================`);

// 1. Create directories
if (!fs.existsSync(levelDir)) {
  fs.mkdirSync(levelDir, { recursive: true });
}
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}
console.log(`  [+] Created folder: src/levels/${levelId}/`);
console.log(`  [+] Created folder: src/levels/${levelId}/components/`);

// 2. Create types.ts
const typesContent = `// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * Telemetry Contract for ${levelId}:
 * Synchronized with Omniverse Kit level handler.
 */

export interface ${pascalName}Telemetry {
  status?: string;
  temperature?: number;
  metric_value?: number;
  [key: string]: any;
}
`;
fs.writeFileSync(typesFile, typesContent, 'utf-8');
console.log(`  [+] Created file: src/levels/${levelId}/types.ts`);

// 3. Create CSS
const cssContent = `/* ${levelId} Specific Stylesheet */

.${levelId}-view-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.${levelId}-hud-card {
  position: absolute;
  bottom: 24px;
  left: 20px;
  width: 300px;
  padding: 16px;
  z-index: 30;
  pointer-events: auto;
}
`;
fs.writeFileSync(cssFile, cssContent, 'utf-8');
console.log(`  [+] Created file: src/levels/${levelId}/${levelId}.css`);

// 4. Create Main View Component
const viewContent = `// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LevelViewProps } from '@/core/types/level';
import { CoordinateAnchor } from '@/core/components/CoordinateAnchor';
import { ${pascalName}Telemetry } from './types';
import './${levelId}.css';

export const ${viewName}: React.FC<LevelViewProps<${pascalName}Telemetry>> = ({
  projections,
  selectPrim
}) => {
  return (
    <div className="${levelId}-view-root">
      {/* Pinned 3D Anchors */}
      {Object.entries(projections).map(([key, pos]) => (
        <CoordinateAnchor
          key={key}
          x={pos.x}
          y={pos.y}
          visible={pos.visible}
          widthPct={pos.width}
          enableZoomScale={pos.width != null}
        >
          <div
            style={{
              padding: '6px 10px',
              background: 'rgba(13, 17, 23, 0.9)',
              border: '1px solid #00e5ff',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#f0f6fc',
              cursor: 'pointer'
            }}
            onClick={() => selectPrim(key)}
          >
            {key}
          </div>
        </CoordinateAnchor>
      ))}
    </div>
  );
};

export default ${viewName};
`;
fs.writeFileSync(viewFile, viewContent, 'utf-8');
console.log(`  [+] Created file: src/levels/${levelId}/${viewName}.tsx`);

// 5. Auto-register in levelRegistry.ts
if (fs.existsSync(registryFile)) {
  let regContent = fs.readFileSync(registryFile, 'utf-8');
  const importStatement = `import ${viewName} from '@/levels/${levelId}/${viewName}';`;
  const regEntry = `  '${levelId}': ${viewName},`;

  if (!regContent.includes(importStatement)) {
    // Add import after last import
    const lastImportIndex = regContent.lastIndexOf('import ');
    const endOfLastImport = regContent.indexOf('\n', lastImportIndex);
    regContent =
      regContent.slice(0, endOfLastImport + 1) +
      `${importStatement}\n` +
      regContent.slice(endOfLastImport + 1);

    // Add entry into LEVEL_REGISTRY object
    const regObjIndex = regContent.indexOf('LEVEL_REGISTRY:');
    const openBraceIndex = regContent.indexOf('{', regObjIndex);
    regContent =
      regContent.slice(0, openBraceIndex + 1) +
      `\n${regEntry}` +
      regContent.slice(openBraceIndex + 1);

    fs.writeFileSync(registryFile, regContent, 'utf-8');
    console.log(`  [+] Auto-registered '${levelId}' in src/core/router/levelRegistry.ts`);
  }
}

console.log(`===========================================================================`);
console.log(`  Level '${levelId}' successfully created and ready to use!`);
console.log(`===========================================================================\n`);
