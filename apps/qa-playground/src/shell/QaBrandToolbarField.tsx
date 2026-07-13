import type { ReactNode } from 'react';
import toolbarStyles from './qa-brand-toolbar.module.css';

export function QaBrandToolbarField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={toolbarStyles.field}>
      <span className={toolbarStyles.fieldLabel} id={htmlFor ? `${htmlFor}-label` : undefined}>
        {label}
      </span>
      <div className={toolbarStyles.fieldControl}>{children}</div>
    </div>
  );
}
