import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDocument(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 6V2H7.5A2.5 2.5 0 0 0 5 4.5v15A2.5 2.5 0 0 0 7.5 22h10a2.5 2.5 0 0 0 2.5-2.5V9h-4a3 3 0 0 1-3-3m3 1h4a2 2 0 0 0-.59-1.41l-3-3A2 2 0 0 0 15 2v4a1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
