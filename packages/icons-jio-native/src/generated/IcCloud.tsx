import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCloud(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11.54q.015-.27 0-.54A6 6 0 0 0 8.8 8a4 4 0 0 0-3.31 2.1A4.48 4.48 0 0 0 6 19h12a4 4 0 0 0 2-7.46"
          />
    </Svg>
  );
}
