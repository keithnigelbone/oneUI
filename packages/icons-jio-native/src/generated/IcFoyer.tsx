import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFoyer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 15a1 1 0 0 0-1 1v3H5v-3a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-2-6A6 6 0 1 0 6 9v9h12zm-3 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
