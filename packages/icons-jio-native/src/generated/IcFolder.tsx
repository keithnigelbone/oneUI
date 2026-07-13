import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFolder(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 20H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4.17a3 3 0 0 1 2.12.88L12.41 6H19a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3"
          />
    </Svg>
  );
}
