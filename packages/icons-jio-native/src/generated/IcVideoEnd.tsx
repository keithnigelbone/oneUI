import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoEnd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.6 7.8-2.6 2V9q.023-.255 0-.51L20.49 5a1.055 1.055 0 0 0-1.148-1.719q-.194.08-.342.229L3.51 19A1.053 1.053 0 1 0 5 20.49L7.44 18H14a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2M5 6a3 3 0 0 0-3 3v6a3 3 0 0 0 .77 2l11-11z"
          />
    </Svg>
  );
}
