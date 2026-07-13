import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPool(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 13a6.2 6.2 0 0 0-4.71 2.29l-.29.29V6a1 1 0 0 1 2 0 1 1 0 0 0 2 0 3 3 0 0 0-6 0v2H7V6a1 1 0 0 1 2 0 1 1 0 0 0 2 0 3 3 0 0 0-6 0v7.09A6 6 0 0 0 4 13a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m-7 3.88a4.3 4.3 0 0 1-1 .12c-1.59 0-2.34-.75-3.29-1.71A11.3 11.3 0 0 0 7.23 14H13zM13 12H7v-2h6z"
          />
    </Svg>
  );
}
