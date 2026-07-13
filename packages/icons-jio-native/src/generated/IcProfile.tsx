import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProfile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            fillRule="evenodd"
            d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
            clipRule="evenodd"
          />
    </Svg>
  );
}
