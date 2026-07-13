import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcResumeReading(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3M8 17a1 1 0 1 1-2 0V7a1 1 0 0 1 2 0zm10-5a1 1 0 0 1-.62.92.84.84 0 0 1-.38.08 1 1 0 0 1-.71-.29L15 11.41l-1.29 1.3a1 1 0 0 1-1.09.21A1 1 0 0 1 12 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
