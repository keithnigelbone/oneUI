import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownload(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 20H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1M16.71 10.29a.996.996 0 0 0-1.41 0l-2.29 2.29V4.99c0-.55-.45-1-1-1s-1 .45-1 1v7.59l-2.29-2.29a.996.996 0 1 0-1.41 1.41l4 4c.2.2.45.29.71.29s.51-.1.71-.29l4-4a.996.996 0 0 0 0-1.41z"
          />
    </Svg>
  );
}
