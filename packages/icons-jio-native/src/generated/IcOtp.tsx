import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOtp(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 11H8.24l.87-1.5a1 1 0 0 0-1.72-1L6.5 10l-.89-1.5a1 1 0 1 0-1.72 1l.87 1.5H3a1 1 0 1 0 0 2h1.76l-.87 1.5a1 1 0 0 0 .36 1.36.9.9 0 0 0 .5.14 1 1 0 0 0 .86-.5L6.5 14l.89 1.51a1 1 0 0 0 .86.5.9.9 0 0 0 .5-.14 1 1 0 0 0 .36-1.36L8.24 13H10a1 1 0 0 0 0-2m11 0h-1.76l.87-1.5a1 1 0 1 0-1.72-1L17.5 10l-.89-1.5a1 1 0 1 0-1.72 1l.87 1.5H14a1 1 0 1 0 0 2h1.76l-.87 1.5a1 1 0 0 0 .36 1.36.9.9 0 0 0 .5.14 1 1 0 0 0 .86-.5l.89-1.5.89 1.51a1 1 0 0 0 .86.5.9.9 0 0 0 .5-.14 1 1 0 0 0 .36-1.36L19.24 13H21a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
