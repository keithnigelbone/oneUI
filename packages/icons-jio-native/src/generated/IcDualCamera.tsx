import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDualCamera(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-13a6 6 0 0 0-6 6v8a6 6 0 1 0 12 0V8a6 6 0 0 0-6-6m0 17a3 3 0 1 1 0-5.999A3 3 0 0 1 12 19m0-8a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
