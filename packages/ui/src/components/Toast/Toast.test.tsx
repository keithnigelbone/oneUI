/**
 * Toast.test.tsx
 * Unit and accessibility tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast, ToastItem, ToastProvider, ToastViewport, useToastManager } from './Toast';

function ManagedToastHarness() {
  const manager = useToastManager();

  return (
    <>
      <button
        type="button"
        onClick={() => manager.add({
          title: 'Managed toast',
          description: 'Managed description',
          timeout: 0,
        })}
      >
        Add toast
      </button>
      <ToastViewport>
        {manager.toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ToastViewport>
    </>
  );
}

describe('Toast', () => {
  it('renders a design-system IconButton close control', () => {
    const onDismiss = vi.fn();

    render(
      <Toast
        title="Unlock to edit"
        description="Use the lock button before changing component overrides."
        variant="warning"
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Unlock to edit');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use the lock button before changing component overrides.'
    );

    const closeButton = screen.getByRole('button', { name: 'Dismiss notification' });
    expect(closeButton.className).toMatch(/iconButton/);
    expect(closeButton).toHaveAttribute('data-size', '8');
    expect(closeButton).toHaveAttribute('data-variant', 'ghost');
    expect(closeButton).toHaveAttribute('data-appearance', 'neutral');

    fireEvent.click(closeButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses managed ToastItem instances through the IconButton close control', async () => {
    const { container } = render(
      <ToastProvider>
        <ManagedToastHarness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    expect(screen.getByText('Managed toast')).toBeInTheDocument();

    const closeButton = container.querySelector('button[aria-label="Dismiss notification"]');
    expect(closeButton).toBeInstanceOf(HTMLButtonElement);

    fireEvent.click(closeButton!);

    await waitFor(() => {
      expect(screen.queryByText('Managed toast')).not.toBeInTheDocument();
    });
  });
});
