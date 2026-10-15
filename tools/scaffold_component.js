// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
/**
 * CLI Generator for Adding Reusable Components:
 * Creates typed React component in src/reusable/ and auto-appends export to index.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawCompArg = process.argv[2];

if (!rawCompArg) {
  console.error('\nUsage: node tools/scaffold_component.js <ComponentName>');
  console.error('Example: node tools/scaffold_component.js StatusBadge\n');
  process.exit(1);
}

// Ensure PascalCase
const compName = rawCompArg
  .trim()
  .replace(/[^a-zA-Z0-9]/g, ' ')
  .split(' ')
  .filter(Boolean)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const reusableDir = path.join(rootDir, 'src', 'reusable');
const compFile = path.join(reusableDir, `${compName}.tsx`);
const indexFile = path.join(reusableDir, 'index.ts');

console.log(`\n===========================================================================`);
console.log(`  SCAFFOLDING REUSABLE COMPONENT: ${compName}`);
console.log(`===========================================================================`);

if (fs.existsSync(compFile)) {
  console.warn(`  [!] File src/reusable/${compName}.tsx already exists! Skipping creation.`);
} else {
  const compContent = `// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import './Reusable.css';

export interface ${compName}Props {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ${compName}: React.FC<${compName}Props> = ({
  label,
  className = '',
  style = {},
  children
}) => {
  return (
    <div className={\`cadit-glass-panel cadit-${compName.toLowerCase()} \${className}\`} style={style}>
      {label && <span style={{ fontWeight: 600, color: '#00e5ff' }}>{label}</span>}
      {children}
    </div>
  );
};

export default ${compName};
`;
  fs.writeFileSync(compFile, compContent, 'utf-8');
  console.log(`  [+] Created file: src/reusable/${compName}.tsx`);
}

// Auto-append export to src/reusable/index.ts
if (fs.existsSync(indexFile)) {
  let indexContent = fs.readFileSync(indexFile, 'utf-8');
  const exportLine = `export * from './${compName}';`;

  if (!indexContent.includes(exportLine)) {
    indexContent = indexContent.trimEnd() + `\n${exportLine}\n`;
    fs.writeFileSync(indexFile, indexContent, 'utf-8');
    console.log(`  [+] Auto-appended '${exportLine}' to src/reusable/index.ts`);
  }
}

console.log(`===========================================================================`);
console.log(`  Component '${compName}' ready! Import with: import { ${compName} } from '@/reusable';`);
console.log(`===========================================================================\n`);
