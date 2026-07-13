import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBiography(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 13V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v11.5A3.5 3.5 0 0 0 6.5 21H20a1 1 0 0 0 0-2h-1v-3.18A3 3 0 0 0 21 13m-4 6H6.5a1.5 1.5 0 1 1 0-3H17z"
          />
    </Svg>
  );
}
