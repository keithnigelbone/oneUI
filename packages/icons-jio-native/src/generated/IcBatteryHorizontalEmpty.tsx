import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBatteryHorizontalEmpty(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m0 6h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1z"
          />
    </Svg>
  );
}
