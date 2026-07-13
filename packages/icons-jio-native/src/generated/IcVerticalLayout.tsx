import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVerticalLayout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 1.99h5v20H6c-1.1 0-2-.9-2-2v-16c0-1.1.9-2 2-2M18 21.99h-5v-20h5c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2"
          />
    </Svg>
  );
}
