import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFirstAid(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7h-2V6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-5 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2M9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9z"
          />
    </Svg>
  );
}
