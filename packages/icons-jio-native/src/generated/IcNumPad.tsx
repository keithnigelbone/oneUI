import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNumPad(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M6.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
