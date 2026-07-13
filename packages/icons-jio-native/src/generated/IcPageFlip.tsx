import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPageFlip(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m15.66 6.61-10-3.5A2 2 0 0 0 3 5v10.5a2 2 0 0 0 1.34 1.89l10 3.5A2 2 0 0 0 17 19V8.5a2 2 0 0 0-1.34-1.89M20 10a1 1 0 0 0-1 1v8a1 1 0 0 0 2 0v-8a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
