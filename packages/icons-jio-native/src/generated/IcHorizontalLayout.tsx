import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHorizontalLayout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 1.99h5.99a2 2 0 0 1 2 2v7H7v-7a2 2 0 0 1 2-2M15 21.99H9.01a2 2 0 0 1-2-2v-7H17v7a2 2 0 0 1-2 2"
          />
    </Svg>
  );
}
