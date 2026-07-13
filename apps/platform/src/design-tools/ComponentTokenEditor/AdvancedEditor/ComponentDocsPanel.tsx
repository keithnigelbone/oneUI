/**
 * ComponentDocsPanel.tsx
 *
 * Auto-generated component documentation from ComponentMeta.
 * Shows description, props table, slots, and capability badges.
 */

'use client';

import React from 'react';
import type { ComponentMeta, PropDescriptor, SlotDescriptor } from '@oneui/shared';
import styles from './ComponentDocsPanel.module.css';

export interface ComponentDocsPanelProps {
  /** Component metadata — drives all documentation */
  meta: ComponentMeta;
}

function formatDefault(value: PropDescriptor['defaultValue']): string {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

function formatType(prop: PropDescriptor): string {
  if (prop.type === 'enum' && prop.optionsByDiscriminator) {
    return 'enum (per ' + prop.optionsByDiscriminator.discriminator + ')';
  }
  if (prop.type === 'enum' && prop.options) {
    if (prop.options.length <= 4) {
      return prop.options.map((o) => typeof o === 'string' ? `"${o}"` : String(o)).join(' | ');
    }
    return `${prop.options.length} options`;
  }
  return prop.type;
}

export function ComponentDocsPanel({ meta }: ComponentDocsPanelProps) {
  const brandOverridableProps = meta.props.filter((p) => p.brandOverridable);

  return (
    <div className={styles.panel}>
      {/* Description */}
      <p className={styles.description}>{meta.description}</p>

      {/* Capability badges */}
      <div className={styles.badges}>
        <span className={styles.badge}>{meta.category}</span>
        {meta.surfaceAware && <span className={styles.badge}>surface-aware</span>}
        {meta.multiAccent && <span className={styles.badge}>multi-accent</span>}
        {meta.slots.length > 0 && <span className={styles.badge}>{meta.slots.length} slots</span>}
      </div>

      {/* Props table */}
      {meta.props.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>Props</h4>
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {meta.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <span className={styles.propName}>{prop.name}</span>
                    {prop.required && <span className={styles.propRequired}> *</span>}
                    {prop.brandOverridable && <span className={styles.brandBadge}> brand</span>}
                  </td>
                  <td><span className={styles.propType}>{formatType(prop)}</span></td>
                  <td><span className={styles.propDefault}>{formatDefault(prop.defaultValue)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Slots */}
      {meta.slots.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>Slots</h4>
          <div className={styles.slotsList}>
            {meta.slots.map((slot) => (
              <div key={slot.name} className={styles.slotItem}>
                <span className={styles.slotName}>{slot.name}</span>
                {slot.description && <span className={styles.slotDesc}>{slot.description}</span>}
                {slot.acceptedTypes && slot.acceptedTypes.length > 0 && (
                  <span className={styles.slotTypes}>
                    Accepts: {slot.acceptedTypes.join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Brand-overridable props summary */}
      {brandOverridableProps.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>Brand Overridable</h4>
          <p className={styles.description}>
            {brandOverridableProps.map((p) => p.name).join(', ')} can be customized per-brand via token overrides.
          </p>
        </>
      )}
    </div>
  );
}

export default ComponentDocsPanel;
