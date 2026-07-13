/**
 * Duplicated from apps/storybook/src/stories/tools/componentRegistry.mui.tsx
 * for the qa-playground Performance page. Keep in sync with the Storybook
 * original.
 *
 * MUI perf entries — isolated chunk so `componentRegistry.tsx` can stay free
 * of static `@mui/*` imports. Loaded only via dynamic `import()`; if MUI is
 * not installed, the playground still boots.
 */

import type { TestComponentEntry } from './componentRegistry.types';
import MuiButton from '@mui/material/Button';
import MuiIconButton from '@mui/material/IconButton';
import MuiChip from '@mui/material/Chip';
import MuiTextField from '@mui/material/TextField';
import MuiCheckbox from '@mui/material/Checkbox';
import MuiSwitch from '@mui/material/Switch';
import MuiToggleButton from '@mui/material/ToggleButton';
import MuiSlider from '@mui/material/Slider';
import MuiCircularProgress from '@mui/material/CircularProgress';
import MuiDivider from '@mui/material/Divider';
import MuiAvatar from '@mui/material/Avatar';
import MuiTypography from '@mui/material/Typography';
import MuiBadge from '@mui/material/Badge';
import MuiFab from '@mui/material/Fab';

export const MUI_COMPONENTS: TestComponentEntry[] = [
  {
    id: 'mui:button',
    familyKey: 'button',
    label: 'MUI Button',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiButton key={i} variant="contained" size="medium">
        {`Btn ${i}·${tick}`}
      </MuiButton>
    ),
  },
  {
    id: 'mui:icon-button',
    familyKey: 'icon-button',
    label: 'MUI IconButton',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiIconButton key={`${i}-${tick}`} color="primary" aria-label={`ib-${i}`}>
        ♥
      </MuiIconButton>
    ),
  },
  {
    id: 'mui:chip',
    familyKey: 'chip',
    label: 'MUI Chip',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiChip key={i} label={`Chip ${i}·${tick}`} color="primary" />
    ),
  },
  {
    id: 'mui:badge',
    familyKey: 'badge',
    label: 'MUI Badge',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiBadge key={i} badgeContent={(tick + i) % 9} color="primary">
        <MuiTypography component="span" variant="caption">
          {`Lbl ${i}·${tick}`}
        </MuiTypography>
      </MuiBadge>
    ),
  },
  {
    id: 'mui:input',
    familyKey: 'input',
    label: 'MUI TextField',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiTextField
        key={i}
        value={`v${i}-${tick}`}
        placeholder="placeholder"
        size="small"
        onChange={() => {}}
        inputProps={{ 'aria-label': `input-${i}` }}
      />
    ),
  },
  {
    id: 'mui:checkbox',
    familyKey: 'checkbox',
    label: 'MUI Checkbox',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiCheckbox
        key={i}
        checked={tick % 2 === 0}
        onChange={() => {}}
        inputProps={{ 'aria-label': `cb-${i}` }}
      />
    ),
  },
  {
    id: 'mui:switch',
    familyKey: 'switch',
    label: 'MUI Switch',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiSwitch
        key={i}
        checked={tick % 2 === 0}
        onChange={() => {}}
        inputProps={{ 'aria-label': `sw-${i}` }}
      />
    ),
  },
  {
    id: 'mui:toggle',
    familyKey: 'toggle',
    label: 'MUI ToggleButton',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiToggleButton
        key={i}
        value={`v${i}`}
        selected={tick % 2 === 0}
        onChange={() => {}}
        size="small"
      >
        {`T${i}`}
      </MuiToggleButton>
    ),
  },
  {
    id: 'mui:slider',
    familyKey: 'slider',
    label: 'MUI Slider',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiSlider
        key={i}
        value={(tick * 7 + i) % 100}
        onChange={() => {}}
        aria-label={`s-${i}`}
        sx={{ width: 120 }}
      />
    ),
  },
  {
    id: 'mui:spinner',
    familyKey: 'spinner',
    label: 'MUI CircularProgress',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiCircularProgress key={`${i}-${tick}`} size={24} />
    ),
  },
  {
    id: 'mui:divider',
    familyKey: 'divider',
    label: 'MUI Divider',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiDivider key={`${i}-${tick}`} sx={{ width: 80 }} />
    ),
  },
  {
    id: 'mui:avatar',
    familyKey: 'avatar',
    label: 'MUI Avatar',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiAvatar key={i}>{`U${(i + tick) % 10}`}</MuiAvatar>
    ),
  },
  {
    id: 'mui:text',
    familyKey: 'text',
    label: 'MUI Typography',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiTypography key={i} variant="body1">{`Text ${i}·${tick}`}</MuiTypography>
    ),
  },
  {
    id: 'mui:fab',
    familyKey: 'fab',
    label: 'MUI Fab',
    library: 'mui',
    renderInstance: (i, tick) => (
      <MuiFab key={`${i}-${tick}`} color="primary" size="small" aria-label={`fab-${i}`}>
        {tick % 2 === 0 ? 'A' : 'B'}
      </MuiFab>
    ),
  },
];
