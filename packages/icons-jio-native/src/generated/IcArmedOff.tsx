import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArmedOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.3 3.46a18.6 18.6 0 0 1-3.48-1.29 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5a10.2 10.2 0 0 0 1.13 4.63zm4.41 1.25a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l1.82-1.82c2 2 4.32 3.11 5.47 3.11 2.25 0 9-4.25 9-11V6a2 2 0 0 0-.42-1.17z"
          />
    </Svg>
  );
}
