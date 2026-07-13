import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAtHomeHazard(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M22 10.07a1.53 1.53 0 0 0-.48-.76L13.85 2.7a2.79 2.79 0 0 0-3.7 0L2.53 9.31A1.53 1.53 0 0 0 2.08 11c.098.29.283.54.53.72.242.187.535.295.84.31H4v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V12h.55a1.5 1.5 0 0 0 .84-.31c.247-.18.432-.43.53-.72a1.54 1.54 0 0 0 .08-.9M11 7a1 1 0 1 1 2 0v6a1 1 0 0 1-2 0zm2.06 11.56a1.5 1.5 0 0 1-2.45-.49 1.5 1.5 0 0 1-.08-.86A1.49 1.49 0 0 1 11.71 16a1.5 1.5 0 0 1 .86.08 1.5 1.5 0 0 1 .49 2.45z"
          />
    </Svg>
  );
}
