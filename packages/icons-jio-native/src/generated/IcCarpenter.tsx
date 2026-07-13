import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCarpenter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3.29 16.29a1 1 0 0 0 0 1.42l2 2A1 1 0 0 0 6 20h.16a1 1 0 0 0 .73-.54L7.62 18H9a1 1 0 0 0 .89-.55l.73-1.45H12a1 1 0 0 0 .89-.55l.73-1.45H15a1 1 0 0 0 .97-.79l-4.8-4.8zM21 6.59 18.41 4a2 2 0 0 0-2.82 0l-1.3 1.29-.29.3L12.59 7 14 8.41l.79.8 1.8 1.79a2 2 0 0 0 2.82 0L21 9.41a2 2 0 0 0 0-2.82m-2.29 2.12a1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 1 1 1.42-1.42l1 1a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
