import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorLocked(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 9a6 6 0 0 1 3 .81V5a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h2.09a7 7 0 0 1-.09-1v-6a6 6 0 0 1 6-6m-8 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m11 1.28V14a3 3 0 0 0-6 0v.27A2 2 0 0 0 12 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-1-1.72M16 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
