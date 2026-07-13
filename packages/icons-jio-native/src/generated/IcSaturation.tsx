import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSaturation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4 6.69-1.24 3.1A1.91 1.91 0 0 1 13.32 13q-.195.023-.39 0a1.9 1.9 0 0 1-1.36-.57 1.92 1.92 0 0 1 .64-3.15L15.31 8a.5.5 0 0 1 .65.65z"
          />
    </Svg>
  );
}
