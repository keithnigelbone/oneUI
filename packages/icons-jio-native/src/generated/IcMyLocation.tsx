import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMyLocation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M19.32 2.17L3.14 9.29a1.9 1.9 0 00.62 3.64l6.77.54.54 6.77a1.9 1.9 0 003.64.62l7.12-16.18a1.9 1.9 0 00-2.51-2.51z'
                fill='currentColor'
              />
    </Svg>
  );
}
