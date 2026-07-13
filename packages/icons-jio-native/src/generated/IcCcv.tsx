import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCcv(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M20 5H4a2 2 0 00-2 2v2h20V7a2 2 0 00-2-2zM2 17a2 2 0 002 2h16a2 2 0 002-2v-6H2v6zm17-4a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2z'
                fill='currentColor'
              />
    </Svg>
  );
}
