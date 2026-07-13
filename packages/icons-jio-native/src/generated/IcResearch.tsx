import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcResearch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 2H5a1 1 0 0 0 0 2h1v12a6 6 0 1 0 12 0V4h1a1 1 0 1 0 0-2m-8.25 11.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5M13.5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
