import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCompress(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.5 12.5h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L2.8 19.79a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l5.29-5.29v3.59c0 .55.45 1 1 1s1-.45 1-1v-6c0-.55-.45-1-1-1zm10.71-9.71a.996.996 0 0 0-1.41 0l-5.29 5.29V4.49c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-3.59l5.29-5.29a.996.996 0 0 0 0-1.41"
          />
    </Svg>
  );
}
