import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFavorite(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M15.6 4A5.6 5.6 0 0012 5.46 5.6 5.6 0 008.4 4 5.36 5.36 0 003 9.44c0 3.37 2.63 6.43 7.16 10.56l.49.45a2 2 0 002.7 0l.49-.44C18.37 15.86 21 12.8 21 9.44A5.36 5.36 0 0015.6 4z'
                fill='currentColor'
              />
    </Svg>
  );
}
