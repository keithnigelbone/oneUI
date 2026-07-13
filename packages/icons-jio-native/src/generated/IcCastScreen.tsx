import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCastScreen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12.71 14.29a1 1 0 0 0-1.42 0l-4 4a1 1 0 0 0-.21 1.09A1 1 0 0 0 8 20h8a1 1 0 0 0 .92-.62 1 1 0 0 0-.21-1.09zM19 5H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3 1 1 0 0 0 0-2 1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1 1 1 0 0 0 0 2 3 3 0 0 0 3-3V8a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
