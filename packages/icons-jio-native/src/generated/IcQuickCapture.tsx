import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcQuickCapture(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m10.88 16.12-2-2a3 3 0 0 1 0-4.24l2-2A3 3 0 0 1 13 7h1V4a2 2 0 0 0-2.26-2l-6 .77A2 2 0 0 0 4 4.78v14.44a2 2 0 0 0 1.74 2l6 .77.26.01a2 2 0 0 0 2-2v-3h-1a3 3 0 0 1-2.12-.88M17 7a1 1 0 0 0 0 2 1 1 0 1 1 0 2h-3.59l.3-.29a1.004 1.004 0 0 0-1.42-1.42l-2 2a1 1 0 0 0-.21.33 1 1 0 0 0 0 .76q.072.186.21.33l2 2a1 1 0 0 0 1.639-.326 1 1 0 0 0-.22-1.094l-.3-.29H17a3 3 0 1 0 0-6"
          />
    </Svg>
  );
}
