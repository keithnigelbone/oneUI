import React from 'react';

type Attention = 'high' | 'medium' | 'low';

type FocusStateGridProps = {
  renderItem: (attention: Attention, selected: boolean) => React.ReactNode;
};

const columns: { label: string; selected: boolean; focused: boolean }[] = [
  { label: 'Idle', selected: false, focused: false },
  { label: 'Focus', selected: false, focused: true },
  { label: 'Idle selected', selected: true, focused: false },
  { label: 'Focus selected', selected: true, focused: true },
];

export function FocusStateGrid({ renderItem }: FocusStateGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', textTransform: 'capitalize' }}>
            {attention}
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
            {columns.map(({ label, selected, focused }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
                {focused ? (
                  <div data-force-state="focus" style={{ display: 'inline-flex' }}>
                    {renderItem(attention, selected)}
                  </div>
                ) : (
                  renderItem(attention, selected)
                )}
                <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
