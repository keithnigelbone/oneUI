import React from 'react';
import { DemoScreen } from '../components/DemoScreen';
import { useTheme } from './ThemeContext';

export default function Index() {
  const { mode, cycleMode } = useTheme();
  return <DemoScreen mode={mode} onToggleMode={cycleMode} />;
}
