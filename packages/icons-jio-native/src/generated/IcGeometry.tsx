import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGeometry(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 14h.11l2.38-.26a.93.93 0 0 0 .6-.29l6.62-6.61a1 1 0 0 0 0-1.42l-2.12-2.13a1 1 0 0 0-1.42 0L3.56 9.91a.93.93 0 0 0-.29.6L3 12.89A1 1 0 0 0 4 14M20.38 3.08a1 1 0 0 0-1.09.21l-16 16a1 1 0 0 0-.21 1.09A1 1 0 0 0 4 21h16a1 1 0 0 0 1-1V4a1 1 0 0 0-.62-.92M17 16a1 1 0 0 1-1 1h-3a1 1 0 0 1-.92-.62 1 1 0 0 1 .21-1.09l3-3a1 1 0 0 1 1.09-.21A1 1 0 0 1 17 13z"
          />
    </Svg>
  );
}
