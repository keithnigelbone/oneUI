/**
 * ComponentTopBarControls.tsx
 *
 * Renders component-specific controls in the TopBar.
 * - center: Docs/Edit mode toggle (ToggleGroup, centered in TopBar)
 * - trailing: ComponentPlatformSelector, DensitySelector, Storybook link
 */

'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ExternalLink } from '@/components/icons';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { ComponentPlatformSelector, DensitySelector } from '@oneui/ui/components/Platform';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import styles from './ComponentTopBarControls.module.css';

/** Map component slug to storybook path segment */
const STORYBOOK_PATHS: Record<string, string> = {
  button: 'components-actions-button',
  'icon-button': 'components-actions-iconbutton',
  fab: 'components-actions-fab',
  link: 'components-actions-link',
  dialog: 'components-overlay-dialog',
  'navigation-menu': 'components-navigation-navigationmenu',
  tabs: 'components-navigation-tabs',
  'toggle-group': 'components-inputs-togglegroup',
  toggle: 'components-inputs-toggle',
  'number-field': 'components-inputs-numberfield',
};

/**
 * Docs/Edit mode toggle — rendered in TopBar center slot.
 * Uses the project's ToggleGroup component for consistency
 * with the bottom Design/Inspect toolbar in the editor canvas.
 */
export const ComponentModeToggle: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentComponentName } = useComponentControls();

  const isEditorRoute = pathname.includes('/editor');
  const currentMode = isEditorRoute ? 'edit' : 'docs';

  const handleModeChange = useCallback(
    (value: string | string[]) => {
      if (!currentComponentName) return;
      const mode = Array.isArray(value) ? value[0] : value;
      if (!mode) return;
      if (mode === 'edit') {
        router.push(`/components/${currentComponentName}/editor`);
      } else {
        router.push(`/components/${currentComponentName}`);
      }
    },
    [currentComponentName, router]
  );

  if (!currentComponentName) return null;

  return (
    <ToggleGroup
      value={currentMode}
      onValueChange={handleModeChange}
      variant="subtool"
      size="small"
    >
      <ToggleGroup.Item value="docs" aria-label="Documentation view">
        Documentation
      </ToggleGroup.Item>
      <ToggleGroup.Item value="edit" aria-label="Editor view">
        Edit
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

/**
 * Right-side controls — rendered in TopBar trailing slot.
 * Platform selector, density, and Storybook link.
 */
export const ComponentTopBarControls: React.FC = () => {
  const {
    previewDensity,
    setPreviewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setSelection,
    platformsConfig,
    currentComponentName,
  } = useComponentControls();

  const storybookPath = currentComponentName
    ? STORYBOOK_PATHS[currentComponentName]
    : null;

  return (
    <>
      <ComponentPlatformSelector
        platformsConfig={platformsConfig}
        selectedPlatformId={selectedPlatformId}
        selectedBreakpointId={selectedBreakpointId}
        onSelectionChange={setSelection}
      />
      <DensitySelector
        currentDensity={previewDensity}
        onDensityChange={setPreviewDensity}
      />
      {storybookPath && (
        <a
          href={`http://localhost:6006/?path=/docs/${storybookPath}--docs`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.controlButton}
          aria-label="View in Storybook"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </>
  );
};
