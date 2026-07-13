import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTennis(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2A10 10 0 0 0 2 12a10 10 0 0 1 10 10 10 10 0 0 0 10-10A10 10 0 0 1 12 2m9.8 8A10 10 0 0 0 14 2.2a8 8 0 0 0 7.8 7.8M2.2 14a10 10 0 0 0 7.8 7.8A8 8 0 0 0 2.2 14"
          />
    </Svg>
  );
}
