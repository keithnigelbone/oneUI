import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDualSim(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 6v10a4 4 0 0 1-4 4H8a2 2 0 0 0 2 2h5a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2m-2 10V4a2 2 0 0 0-2-2H9.79a3 3 0 0 0-2.15.91L4.85 5.78A3 3 0 0 0 4 7.87V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M6 10h2v2H6zm4 6H6.5a.5.5 0 0 1-.5-.5V14h4zm0-6h4v2h-4zm3.5 6H12v-2h2v1.5a.5.5 0 0 1-.5.5"
          />
    </Svg>
  );
}
