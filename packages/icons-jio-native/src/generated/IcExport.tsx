import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcExport(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M9.71 6.71L11 5.41V16a1 1 0 102 0V5.41l1.29 1.3a1 1 0 001.639-.325 1 1 0 00-.219-1.095l-3-3a1 1 0 00-1.42 0l-3 3a1.004 1.004 0 001.42 1.42zM20 12a1 1 0 00-1 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6a1 1 0 00-2 0v6a3 3 0 003 3h12a3 3 0 003-3v-6a1 1 0 00-1-1z'
                fill='currentColor'
              />
    </Svg>
  );
}
