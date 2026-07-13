import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBedSleeping(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 3h.79l-1.14 1.15a.47.47 0 0 0-.11.54A.5.5 0 0 0 14 5h2a.5.5 0 0 0 0-1h-.79l1.14-1.15a.47.47 0 0 0 .11-.54A.5.5 0 0 0 16 2h-2a.5.5 0 0 0 0 1m-3.5 3h.79l-1.14 1.15a.47.47 0 0 0-.11.54.5.5 0 0 0 .46.31h2a.5.5 0 0 0 0-1h-.79l1.14-1.15a.47.47 0 0 0-.05-.776.5.5 0 0 0-.3-.074h-2a.5.5 0 0 0 0 1M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4m12-3h-6a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h11v-2a3 3 0 0 0-3-3M8 13H4V6a1 1 0 0 0-2 0v13a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-3H11a3 3 0 0 1-3-3"
          />
    </Svg>
  );
}
