import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMouse(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a6 6 0 0 0-6 6v8a6 6 0 1 0 12 0V8a6 6 0 0 0-6-6m1 6a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
