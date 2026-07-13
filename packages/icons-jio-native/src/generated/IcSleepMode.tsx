import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSleepMode(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.82 14.75a7 7 0 0 1-8-10 1 1 0 0 0-1.16-1.43A9 9 0 1 0 20 16.18a1 1 0 0 0-1.15-1.43zM14.5 8h.79l-1.14 1.15a.47.47 0 0 0-.11.54.5.5 0 0 0 .46.31h2a.5.5 0 0 0 0-1h-.79l1.14-1.15a.47.47 0 0 0-.05-.776.5.5 0 0 0-.3-.074h-2a.5.5 0 0 0 0 1m6-3h-.79l1.14-1.15a.47.47 0 0 0-.05-.776.5.5 0 0 0-.3-.074h-2a.5.5 0 0 0 0 1h.79l-1.14 1.15a.47.47 0 0 0-.11.54.5.5 0 0 0 .46.31h2a.5.5 0 0 0 0-1"
          />
    </Svg>
  );
}
