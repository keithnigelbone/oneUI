import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLibrary(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2m11.88 15.32L17.09 5.16a2.001 2.001 0 0 0-3.76 1.37l4.79 13.15a2 2 0 1 0 3.76-1.36"
          />
    </Svg>
  );
}
