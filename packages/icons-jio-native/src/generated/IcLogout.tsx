import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLogout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.87 3.91a1 1 0 0 0-1.58.966 1 1 0 0 0 .4.654 8 8 0 1 1-9.38 0 1.002 1.002 0 0 0-1.18-1.62 10 10 0 1 0 11.74 0M12 8a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
