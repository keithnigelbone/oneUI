import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEBookReader(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-9H8a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2m2-4H8a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
