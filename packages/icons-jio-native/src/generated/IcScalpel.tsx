import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScalpel(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13.29 12.71c.2.2.45.29.71.29s.51-.1.71-.29l6-6a.996.996 0 0 0 0-1.41l-2-2a.996.996 0 0 0-1.41 0l-6 6a.996.996 0 0 0 0 1.41l2 2zm-3.21-.21-6.79 6.79c-.29.29-.37.72-.22 1.09s.52.62.92.62h1.7c.4 0 .78-.12 1.11-.34l2.75-1.83c.28-.19.45-.5.45-.83v-2.59l1.5-1.5-1.41-1.41zm3.91 6.5h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1m6 0h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
