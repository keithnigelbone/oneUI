import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCarSide(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 10h-2.41l-1.37-2.46A3 3 0 0 0 13.6 6H8.46a3 3 0 0 0-2.6 1.5l-1.47 2.56A3 3 0 0 0 2 13v1a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2M7 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-6H7l.72-1.45a1 1 0 0 1 .9-.55H9zm2 0V8h2.38a1 1 0 0 1 .9.55L15 10zm6 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
