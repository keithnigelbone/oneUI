import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHomeMaintenance(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M22 10.07a1.53 1.53 0 0 0-.48-.76L13.85 2.7a2.79 2.79 0 0 0-3.7 0L2.53 9.31A1.53 1.53 0 0 0 2.08 11c.098.29.283.54.53.72.242.187.535.295.84.31H4v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V12h.55a1.5 1.5 0 0 0 .84-.31c.247-.18.432-.43.53-.72a1.54 1.54 0 0 0 .08-.9m-5.54 8.34a2 2 0 0 1-2.82 0L12 16.85a3.8 3.8 0 0 1-1 .15 4 4 0 0 1-4-4 2 2 0 0 1 0-.23 1.06 1.06 0 0 1 .67-.84 1 1 0 0 1 1 .21l1.57 1.57 1.42-1.42-1.57-1.57a1 1 0 0 1 .7-1.72H11a4 4 0 0 1 4 4 3.8 3.8 0 0 1-.15 1l1.56 1.57a2 2 0 0 1 0 2.84z"
          />
    </Svg>
  );
}
