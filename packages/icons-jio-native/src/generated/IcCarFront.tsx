import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCarFront(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.77 11.16 19.4 7.05a3 3 0 0 0-2.84-2H7.41a3 3 0 0 0-2.85 2.02l-1.34 4.09A2 2 0 0 0 2 13v3a2 2 0 0 0 1 1.72V19a1 1 0 1 0 2 0v-1h14v1a1 1 0 1 0 2 0v-1.28A2 2 0 0 0 22 16v-3a2 2 0 0 0-1.23-1.84M6.46 7.69a1 1 0 0 1 1-.69h9.15a1 1 0 0 1 1 .68l1 3.32H5.38zm.25 7a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 5 13.8a1 1 0 0 1 .8-.8c.195-.038.397-.017.58.06a.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27m12 0a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45c-.08-.175-.108-.37-.08-.56a1 1 0 0 1 .8-.8c.195-.038.397-.017.58.06a.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27"
          />
    </Svg>
  );
}
