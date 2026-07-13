import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPulseOximeter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7c-1.1 0-2 .9-2 2v11c0 3.87 3.13 7 7 7s7-3.13 7-7V4c0-1.1-.9-2-2-2m-5 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4-7.5c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"
          />
    </Svg>
  );
}
