import type { ReactNode } from 'react';
import styles from './MachineDocs.module.css';

interface MachineDocSectionProps {
  title: string;
  children: ReactNode;
}

export function MachineDocSection({ title, children }: MachineDocSectionProps) {
  return (
    <section className={styles.infoCard}>
      <h4 className={styles.infoTitle}>{title}</h4>
      {children}
    </section>
  );
}
