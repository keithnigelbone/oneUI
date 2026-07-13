/**
 * ComponentScreen — generic router. Looks up the per-component Screen in
 * the registry and renders it. The Screen itself owns layout, testIDs,
 * and JSX (no dynamic showcase iteration).
 */

import React from 'react';

import type { ComponentProps } from '../../App';
import { componentRegistry } from '../componentRegistry';

export function ComponentScreen(props: ComponentProps): React.ReactElement {
  const { Screen } = componentRegistry[props.route.params.name];
  return <Screen {...props} />;
}
