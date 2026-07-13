import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHdrAuto(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 13h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2c1 0 3-.84 3-4s-2-4-3-4m0 6h-1v-4h1c.17 0 1 .16 1 2s-.83 2-1 2m-5-6a1 1 0 0 0-1 1v2H4v-2a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1m12 0h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-1h1q.18.015.36 0l.75 1.49A1 1 0 0 0 21 21a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34l-.73-1.47A3 3 0 0 0 19 13m0 4h-1v-2h1a1 1 0 0 1 0 2m1-14h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-.32 6.47h-.18a.51.51 0 0 1-.5-.29l-.25-.68h-1.53l-.22.68a.51.51 0 0 1-.65.29.52.52 0 0 1-.35-.65l1.5-4a.52.52 0 0 1 .94 0l1.5 4a.51.51 0 0 1-.26.65m-2.08-2h.8L18 6.42z"
          />
    </Svg>
  );
}
