import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDthSignal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.05 5.64a1 1 0 0 0-1.41 0 9 9 0 1 0 12.72 12.72 1 1 0 0 0 .3-.7 1 1 0 0 0-.3-.71zm6.07-2.56a1.007 1.007 0 1 0-.24 2 7 7 0 0 1 6.06 6.06 1 1 0 0 0 1 .88h.12a1 1 0 0 0 .87-1.11 9 9 0 0 0-7.81-7.83m1.77 8.17a1 1 0 0 0 1 .75h.25a1 1 0 0 0 .72-1.22 5 5 0 0 0-3.58-3.58 1.002 1.002 0 1 0-.5 1.94 3 3 0 0 1 2.11 2.11"
          />
    </Svg>
  );
}
