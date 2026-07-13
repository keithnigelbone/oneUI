import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from './SettingsModal';

function renderSettings(onSubThemeChange = vi.fn()) {
  const onDensityChange = vi.fn();
  const onClose = vi.fn();

  render(
    <SettingsModal
      isOpen
      onClose={onClose}
      theme="light"
      density="default"
      onDensityChange={onDensityChange}
      subTheme={{
        brandName: 'Jio',
        currentSubThemeId: 'cinema',
        options: [
          { id: null, label: 'Base brand', description: 'Jio' },
          { id: 'cinema', label: 'Jio Cinema', description: 'Sub-theme' },
          { id: 'mart', label: 'Jio Mart', description: 'Sub-theme' },
        ],
        onChange: onSubThemeChange,
      }}
    />,
  );

  return { onSubThemeChange, onDensityChange, onClose };
}

describe('SettingsModal brand theme settings', () => {
  it('removes the Default Theme option and shows active brand sub-themes', () => {
    renderSettings();

    expect(screen.queryByText('Default Theme')).toBeNull();
    expect(screen.queryByText('Theme Application')).toBeNull();
    expect(screen.getByText('Brand Theme')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Base brand/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Jio Cinema/ }).getAttribute('data-selected')).toBe('true');
    expect(screen.getByRole('button', { name: /Jio Mart/ })).toBeTruthy();
  });

  it('calls sub-theme change for base brand and sub-theme selections', async () => {
    const user = userEvent.setup();
    const onSubThemeChange = vi.fn();
    renderSettings(onSubThemeChange);

    await user.click(screen.getByRole('button', { name: /Base brand/ }));
    await user.click(screen.getByRole('button', { name: /Jio Mart/ }));

    expect(onSubThemeChange).toHaveBeenNthCalledWith(1, null);
    expect(onSubThemeChange).toHaveBeenNthCalledWith(2, 'mart');
  });
});
