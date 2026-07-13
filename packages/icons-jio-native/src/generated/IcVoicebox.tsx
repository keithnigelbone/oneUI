import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVoicebox(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 8H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2M13 7c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1M18 7.41 19.41 6A.996.996 0 1 0 18 4.59L16.59 6a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29zM20 10h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
