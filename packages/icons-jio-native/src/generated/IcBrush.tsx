import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBrush(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.5 11A4.75 4.75 0 0 0 4 15.5c0 2.81-.68 3.76-.74 3.82a1 1 0 0 0-.18 1.06A1 1 0 0 0 4 21c4.19 0 9-.62 9-5.5A4.75 4.75 0 0 0 8.5 11m11.62-7.12a3 3 0 0 0-4.24 0l-5.45 5.44a7 7 0 0 1 4.22 4.27l5.47-5.47a3 3 0 0 0 0-4.24"
          />
    </Svg>
  );
}
