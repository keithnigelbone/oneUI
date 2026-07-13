import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMergeOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.71 7.7 11 5.41v3.35l2.01-2.01V5.41l.67.67 1.42-1.42-2.37-2.37a.996.996 0 0 0-1.41 0l-4.01 4A.996.996 0 1 0 8.72 7.7zM21.71 3.7a.996.996 0 0 0 0-1.41.99.99 0 0 0-1.39-.02L2.53 20.06s-.02.01-.03.02l-.21.21a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.36-.36c.14.38.5.66.93.66h1c2.55 0 4.78-1.37 6-3.41A6.99 6.99 0 0 0 18 22h1c.55 0 1-.45 1-1s-.45-1-1-1h-.99c-2.76 0-5-2.24-5-5v-2.61zM11 15c0 2.76-2.24 5-5 5h-.6l5.6-5.6z"
          />
    </Svg>
  );
}
