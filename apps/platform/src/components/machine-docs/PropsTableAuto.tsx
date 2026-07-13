'use client';

import type { ComponentPropDoc } from '@oneui/shared';
import styles from './MachineDocs.module.css';

interface PropsTableAutoProps {
  propsList: ComponentPropDoc[];
}

export function PropsTableAuto({ propsList }: PropsTableAutoProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {propsList.map((prop) => (
          <tr key={prop.name}>
            <td>
              <code className={styles.propName}>{prop.name}</code>
            </td>
            <td>
              <code className={styles.inlineCode}>{prop.type}</code>
            </td>
            <td>{prop.defaultValue ?? '-'}</td>
            <td>{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
