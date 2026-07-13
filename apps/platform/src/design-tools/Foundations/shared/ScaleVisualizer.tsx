/**
 * ScaleVisualizer.tsx
 * Visual representation of design token scales
 * Supports color, spacing, typography, and generic scales
 */

import { useCallback } from 'react';
import styles from './ScaleVisualizer.module.css';
import {
  ScaleVisualizerProps,
  ScaleItem,
  calculateBarWidth,
  formatScaleValue,
} from './ScaleVisualizer.shared';

export const ScaleVisualizer: React.FC<ScaleVisualizerProps> = ({
  items,
  maxValue,
  orientation = 'vertical',
  showValues = true,
  showLabels = true,
  type = 'generic',
  onItemClick,
  selectedIndex,
}) => {
  // Calculate max value for bar widths if not provided
  const calculatedMax =
    maxValue ||
    Math.max(
      ...items
        .map((item) =>
          typeof item.value === 'number' ? item.value : 0
        )
        .filter((v) => v > 0),
      1
    );

  const handleItemClick = useCallback(
    (item: ScaleItem, index: number) => {
      if (onItemClick) {
        onItemClick(item, index);
      }
    },
    [onItemClick]
  );

  const containerClassName = [
    styles.container,
    orientation === 'horizontal' && styles.horizontal,
  ]
    .filter(Boolean)
    .join(' ');

  if (type === 'color') {
    return (
      <div className={containerClassName}>
        {items.map((item, index) => (
          <ColorScaleItem
            key={item.label}
            item={item}
            index={index}
            isSelected={selectedIndex === index}
            onClick={onItemClick ? () => handleItemClick(item, index) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {items.map((item, index) => {
        const barWidth =
          typeof item.value === 'number'
            ? calculateBarWidth(item.value, calculatedMax)
            : 50;

        const itemClassName = [
          styles.item,
          item.highlight && styles.itemHighlight,
          onItemClick && styles.itemClickable,
          selectedIndex === index && styles.itemSelected,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={item.label}
            className={itemClassName}
            onClick={
              onItemClick ? () => handleItemClick(item, index) : undefined
            }
            role={onItemClick ? 'button' : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            onKeyDown={
              onItemClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleItemClick(item, index);
                    }
                  }
                : undefined
            }
          >
            {showLabels && <span className={styles.label}>{item.label}</span>}

            <div className={styles.barContainer}>
              {item.color ? (
                <div
                  className={styles.barColor}
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <div className={styles.bar} style={{ width: `${barWidth}%` }} />
              )}
            </div>

            {showValues && (
              <span className={styles.value}>
                {formatScaleValue(item.value, type)}
              </span>
            )}

            {item.description && (
              <span className={styles.description}>{item.description}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Separate component for color scale items with better layout
interface ColorScaleItemProps {
  item: ScaleItem;
  index: number;
  isSelected: boolean;
  onClick?: () => void;
}

const ColorScaleItem: React.FC<ColorScaleItemProps> = ({
  item,
  isSelected,
  onClick,
}) => {
  const itemClassName = [
    styles.item,
    styles.colorItem,
    item.highlight && styles.itemHighlight,
    onClick && styles.itemClickable,
    isSelected && styles.itemSelected,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={itemClassName}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClick();
              }
            }
          : undefined
      }
    >
      <div className={styles.colorRow}>
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: item.color || String(item.value) }}
        />
        <span className={styles.label}>{item.label}</span>
        <span className={styles.colorValue}>{item.value}</span>
      </div>
      {item.description && (
        <span className={styles.description}>{item.description}</span>
      )}
    </div>
  );
};
