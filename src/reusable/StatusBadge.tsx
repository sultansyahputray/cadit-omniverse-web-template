// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React from 'react';
import './Reusable.css';

export interface StatusBadgeProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  className = '',
  style = {},
  children
}) => {
  return (
    <div className={`cadit-glass-panel cadit-statusbadge ${className}`} style={style}>
      {label && <span style={{ fontWeight: 600, color: '#00e5ff' }}>{label}</span>}
      {children}
    </div>
  );
};

export default StatusBadge;
