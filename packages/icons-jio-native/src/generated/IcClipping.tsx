import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcClipping(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4m1-2V9a1 1 0 0 0-2 0v6a1 1 0 1 0 2 0m13-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m-1 2v6a1 1 0 0 0 2 0V9a1 1 0 0 0-2 0m1 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4M15 4H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4m10 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
