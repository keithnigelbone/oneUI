import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCablePlug(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 6h-2V3a1 1 0 0 0-2 0v3h-4V3a1 1 0 0 0-2 0v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h5v4a1 1 0 0 0 2 0v-4h5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
