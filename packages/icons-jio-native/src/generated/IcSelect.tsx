import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSelect(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.52 9.04-15-6.82C4.14 1.59 2.4 2.31 2 4.07c-.1.46-.03.94.17 1.36L9.1 20.67c.19.42.5.79.91 1 1.71.88 3.44-.13 3.75-1.68l.51-2.57a4.01 4.01 0 0 1 3.14-3.14l2.72-.54c.45-.09.89-.31 1.18-.66 1.24-1.46.66-3.38-.79-4.04"
          />
    </Svg>
  );
}
