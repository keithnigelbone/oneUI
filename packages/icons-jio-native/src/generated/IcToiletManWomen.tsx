import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcToiletManWomen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 8.61a2 2 0 0 0-4 0l-1 5a2 2 0 0 0 .41 1.66A2 2 0 0 0 5 16v4a1 1 0 1 0 2 0v-4a2 2 0 0 0 1.55-.73A2 2 0 0 0 9 13.61zM6 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-6-3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m7 4h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2v4a1 1 0 0 0 2 0v-4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
