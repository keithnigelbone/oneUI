import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCardiology(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7H6V3c0-.55-.45-1-1-1s-1 .45-1 1v11c0 4.42 3.58 8 8 8h5c1.66 0 3-1.34 3-3v-4c0-4.42-3.58-8-8-8m1-3h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-2.41 0-4.43 1.72-4.9 4h2.08c.41-1.16 1.51-2 2.82-2"
          />
    </Svg>
  );
}
