import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVinylRecord(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </Svg>
  );
}
