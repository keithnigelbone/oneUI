import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMedicine(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.12 8.71 18 7.59A2 2 0 0 0 16.59 7H17a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h.41A2 2 0 0 0 6 7.59L4.88 8.71A3 3 0 0 0 4 10.83V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8.17a3 3 0 0 0-.88-2.12M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
