import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBold(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.85 11.15c.91-1.11 1.38-2.6 1.03-4.22C18.37 4.6 16.21 3 13.82 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7.28c2.86 0 5.41-2.1 5.69-4.95.2-1.99-.68-3.79-2.12-4.9M8 6h6c1.1 0 2 .9 2 2s-.9 2-2 2H8zm6.5 12H8v-5h6.5a2.5 2.5 0 0 1 0 5"
          />
    </Svg>
  );
}
