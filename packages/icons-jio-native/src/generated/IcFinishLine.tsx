import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFinishLine(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 2a1 1 0 0 0-1 1v19h2V3a1 1 0 0 0-1-1m14.37 1.07c-2.75-1.1-5-.58-7.11-.07A14.6 14.6 0 0 1 8 3.56v12h.45a18.3 18.3 0 0 0 4.27-.56c2-.48 3.75-.89 5.91 0a1 1 0 0 0 1.27-.49A1 1 0 0 0 20 14V4a1 1 0 0 0-.63-.93"
          />
    </Svg>
  );
}
