import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUploads(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M2 12a10 10 0 1020 0 10 10 0 00-20 0zm10.71-4.71l3 3a1.002 1.002 0 01-.325 1.639 1 1 0 01-1.095-.219L13 10.41V16a1 1 0 01-2 0v-5.59l-1.29 1.3a1.004 1.004 0 11-1.42-1.42l3-3a1 1 0 01.33-.21 1 1 0 01.76 0 1 1 0 01.33.21z'
                fill='currentColor'
              />
    </Svg>
  );
}
