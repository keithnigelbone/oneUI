import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrash(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M20 6h-2V5a3 3 0 00-3-3H9a3 3 0 00-3 3v1H4a1 1 0 000 2h1v11a3 3 0 003 3h8a3 3 0 003-3V8h1a1 1 0 100-2zM9 18a1 1 0 11-2 0v-7a1 1 0 112 0v7zm4 0a1 1 0 01-2 0v-7a1 1 0 012 0v7zm4 0a1 1 0 01-2 0v-7a1 1 0 012 0v7zM8 5a1 1 0 011-1h6a1 1 0 011 1v1H8V5z'
                fill='currentColor'
              />
    </Svg>
  );
}
