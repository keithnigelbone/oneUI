import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcThinkingBrain(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.89 13.54-2-3.86A8 8 0 1 0 7 17.92V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1a3 3 0 0 0 3-3v-1h1a1 1 0 0 0 .89-1.46m-6.32-4.46-7.06 4.09a1.12 1.12 0 0 1-1.63-.65 5.14 5.14 0 0 1 0-2.83 5.43 5.43 0 0 1 4.58-3.87 5.28 5.28 0 0 1 4.32 1.52 1.1 1.1 0 0 1-.21 1.74"
          />
    </Svg>
  );
}
