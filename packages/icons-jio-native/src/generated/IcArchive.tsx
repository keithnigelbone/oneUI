import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArchive(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3H4a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2M4 18a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9H4zm6-6h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2"
          />
    </Svg>
  );
}
