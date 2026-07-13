import React from 'react';
import { DemoScreen } from '../components/DemoScreen';

interface HomeScreenProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export function HomeScreen({ mode, onToggleMode }: HomeScreenProps) {
  return <DemoScreen mode={mode} onToggleMode={onToggleMode} />;
}
