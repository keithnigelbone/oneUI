import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorUnlocked(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 9a6 6 0 0 1 3 .81V5a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h2.09a7 7 0 0 1-.09-1v-6a6 6 0 0 1 6-6m-8 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m10 1h-3a1 1 0 0 1 .29-.71 1 1 0 0 1 1.21-.15 1 1 0 1 0 1-1.73 3 3 0 0 0-3.62.47 3 3 0 0 0-.88 2.38A2 2 0 0 0 12 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-2 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
