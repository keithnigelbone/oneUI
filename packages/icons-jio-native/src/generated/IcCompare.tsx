import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCompare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2.07 7.93 4 15.14V6a4 4 0 0 1 .07-.68l-.59.16a2 2 0 0 0-1.41 2.45M8.71 4H8a2 2 0 0 0-2 2v7.59L8.29 5a3.9 3.9 0 0 1 .42-1m11.81 2.19-7.84-2.12a2 2 0 0 0-2.46 1.42L7.07 17.37a2 2 0 0 0 1.41 2.44l7.84 2.12q.26.072.53.07a2 2 0 0 0 1.93-1.49l3.15-11.88a2 2 0 0 0-1.41-2.44M10 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
