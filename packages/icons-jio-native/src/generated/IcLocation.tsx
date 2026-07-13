import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLocation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M12 2a7.82 7.82 0 00-8 7.6c0 5.08 5.91 11.14 6.59 11.81a2 2 0 002.82 0C14.09 20.74 20 14.68 20 9.6A7.82 7.82 0 0012 2zm0 11a3 3 0 110-6 3 3 0 010 6z'
                fill='currentColor'
              />
    </Svg>
  );
}
