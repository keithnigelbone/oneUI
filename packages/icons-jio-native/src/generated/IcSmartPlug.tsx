import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartPlug(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 6h-1V3a1 1 0 0 0-2 0v3H9V3a1 1 0 0 0-2 0v3H6a2 2 0 0 0-2 2v10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a2 2 0 0 0-2-2m-6 11a3 3 0 1 1 0-5.999A3 3 0 0 1 12 17"
          />
    </Svg>
  );
}
