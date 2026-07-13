import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKitchenExtractor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 17a1 1 0 0 0 0 2 1 1 0 0 1 1 1v1a1 1 0 1 0 2 0v-1a3 3 0 0 0-3-3m6 0a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m7.41-5.41-3-3a1.5 1.5 0 0 0-.41-.31V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4.28a1.5 1.5 0 0 0-.41.31l-3 3a2 2 0 0 0-.44 2.18A2 2 0 0 0 6 15h12a2 2 0 0 0 1.85-1.23 2 2 0 0 0-.44-2.18M18 17a3 3 0 0 0-3 3v1a1 1 0 0 0 2 0v-1a1 1 0 0 1 1-1 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
