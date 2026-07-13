import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmileyUnhappy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m8.26 8.85a1 1 0 0 1-1.37-.32 4 4 0 0 0-6.78 0 1 1 0 1 1-1.69-1.06 6 6 0 0 1 10.16 0 1 1 0 0 1-.32 1.38"
          />
    </Svg>
  );
}
