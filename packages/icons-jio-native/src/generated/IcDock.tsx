import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.14 4H8.86C7.83 4 7 4.83 7 5.86v7.28C7 14.17 7.83 15 8.86 15h10.28c1.03 0 1.86-.83 1.86-1.86V5.86C21 4.83 20.17 4 19.14 4M19 13H9V6h10zm-4 4H6c-.55 0-1-.45-1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v7c0 1.65 1.35 3 3 3h9c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
