import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProtectionUnlock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 14h-3a1 1 0 0 1 .29-.71 1 1 0 0 1 1.21-.15 1 1 0 1 0 1-1.73 3 3 0 0 0-3.62.47 3 3 0 0 0-.88 2.38A2 2 0 0 0 13 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-2 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3.46-14.31a2 2 0 0 0-1.3-.69 18.8 18.8 0 0 1-6.34-1.83 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5c0 5.92 5.21 9.93 8 10.81V15a6 6 0 0 1 6-6 5.93 5.93 0 0 1 4 1.54V6a2 2 0 0 0-.54-1.31"
          />
    </Svg>
  );
}
