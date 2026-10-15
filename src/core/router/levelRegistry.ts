// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import { LevelViewProps } from '../types/level';

// Registered Level Views (Auto-updated by add_web_level.bat)
import Level01DefaultView from '@/levels/level_01_default/Level01DefaultView';

export const LEVEL_REGISTRY: Record<string, React.ComponentType<LevelViewProps<any>>> = {
  'level_01_default': Level01DefaultView,
};

