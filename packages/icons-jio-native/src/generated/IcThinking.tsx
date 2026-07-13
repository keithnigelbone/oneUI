import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcThinking(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 16.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0m.5 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m8-15a4 4 0 0 0-.48 0A5 5 0 0 0 8.4 5H8a4 4 0 0 0 0 8 4.2 4.2 0 0 0 1.33-.24 5 5 0 0 0 9.31.08A4.49 4.49 0 0 0 17.5 4"
          />
    </Svg>
  );
}
