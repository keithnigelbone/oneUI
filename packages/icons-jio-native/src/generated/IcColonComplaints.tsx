import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcColonComplaints(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 3c-2.21 0-4 1.79-4 4v1c-1.1 0-2-.9-2-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2c0 2.21 1.79 4 4 4v6c0 .55-.45 1-1 1s-1-.45-1-1c0-1.65-1.35-3-3-3s-3 1.35-3 3v4c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55.45-1 1-1s1 .45 1 1v1c0 1.65 1.35 3 3 3h3c4.42 0 8-3.58 8-8V9c0-3.31-2.69-6-6-6m-2 9c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1m2 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m3-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1"
          />
    </Svg>
  );
}
