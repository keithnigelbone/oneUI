import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDisposeOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.894 6.55a1 1 0 0 0-1.78 0 5.7 5.7 0 0 1-1.24 1.6 14.55 14.55 0 0 0-2-5.7 1 1 0 0 0-1.16-.45 1 1 0 0 0-.71 1 3.82 3.82 0 0 1-1.26 2.5l10.06 10.06c.55-3.2-.75-6.7-1.91-9.01m2.82 12.74-16-16a1.004 1.004 0 0 0-1.42 1.42L6.634 8a8 8 0 0 0 1.62 13 3.13 3.13 0 0 1 .88-2.9c1-1.08 1.87-2 1.87-2.73a.5.5 0 0 1 .73-.37 4.64 4.64 0 0 1 2.14 2.52c1.05-2.13 2.34 2.19 2 3.45a9 9 0 0 0 2.13-1.61l1.34 1.35a1 1 0 0 0 1.42 0 1 1 0 0 0-.05-1.42"
          />
    </Svg>
  );
}
