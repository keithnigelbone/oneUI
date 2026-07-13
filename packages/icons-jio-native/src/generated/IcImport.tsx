import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcImport(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M11.29 16.71a1.002 1.002 0 001.42 0l3-3a1.004 1.004 0 10-1.42-1.42L13 13.59V3a1 1 0 00-2 0v10.59l-1.29-1.3a1.004 1.004 0 10-1.42 1.42l3 3zM20 12a1 1 0 00-1 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6a1 1 0 10-2 0v6a3 3 0 003 3h12a3 3 0 003-3v-6a1 1 0 00-1-1z'
                fill='currentColor'
              />
    </Svg>
  );
}
