import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMinimise(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M12 2a10 10 0 100 20 10 10 0 000-20zm4 11H8a1 1 0 010-2h8a1 1 0 010 2z'
                fill='currentColor'
              />
    </Svg>
  );
}
