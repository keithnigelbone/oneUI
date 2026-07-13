import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVeg(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5M18 3H6C4.35 3 3 4.35 3 6v12c0 1.65 1.35 3 3 3h12c1.65 0 3-1.35 3-3V6c0-1.65-1.35-3-3-3m1 15c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1z"
          />
    </Svg>
  );
}
