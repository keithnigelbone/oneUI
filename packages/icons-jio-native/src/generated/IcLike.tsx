import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLike(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M3 11v7a2 2 0 002 2h2V9H5a2 2 0 00-2 2zm17.24-1A3 3 0 0018 9h-4V5.08a2 2 0 00-3.94-.57l-1 4A2.12 2.12 0 009 9v11h8.44a3 3 0 003-2.67l.55-5a2.999 2.999 0 00-.75-2.33z'
                fill='currentColor'
              />
    </Svg>
  );
}
