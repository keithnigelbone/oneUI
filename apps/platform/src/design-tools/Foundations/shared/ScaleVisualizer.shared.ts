/**
 * ScaleVisualizer.shared.ts
 * Shared types for scale visualization component
 */

export interface ScaleItem {
  label: string;
  value: string | number;
  color?: string; // For color scales
  highlight?: boolean;
  description?: string;
}

export interface ScaleVisualizerProps {
  items: ScaleItem[];
  maxValue?: number; // For calculating relative bar widths
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showLabels?: boolean;
  type?: 'color' | 'spacing' | 'typography' | 'generic';
  onItemClick?: (item: ScaleItem, index: number) => void;
  selectedIndex?: number;
}

export function calculateBarWidth(
  value: number | string,
  maxValue: number
): number {
  if (typeof value === 'string') return 50; // Default for non-numeric
  return Math.min((value / maxValue) * 100, 100);
}

export function formatScaleValue(
  value: string | number,
  type: ScaleVisualizerProps['type']
): string {
  if (typeof value === 'string') return value;

  switch (type) {
    case 'spacing':
      return `${value}px`;
    case 'typography':
      return `${value}px`;
    default:
      return String(value);
  }
}
