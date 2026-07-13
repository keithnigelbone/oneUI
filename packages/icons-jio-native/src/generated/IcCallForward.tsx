import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallForward(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.16 14.32a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.42 0L9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13c-.18 1.4-.08 4.74 3.67 8.47s7.07 3.85 8.48 3.68a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83zm2.55-8-2-2a1.005 1.005 0 0 0-1.42 1.42L18.59 7l-1.3 1.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42zm-7.42 3.39a1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42l-2-2a1.005 1.005 0 0 0-1.42 1.42L14.59 7l-1.3 1.29a1 1 0 0 0 0 1.42"
          />
    </Svg>
  );
}
