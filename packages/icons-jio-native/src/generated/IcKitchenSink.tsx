import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKitchenSink(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 11h-2V6a3 3 0 0 0-6 0 1 1 0 0 0 2 0 1 1 0 0 1 2 0v5H7V9h1a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2h1v2a2 2 0 1 0 0 4v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
