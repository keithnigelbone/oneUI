import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhotoResize(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m9-10H6a3 3 0 0 0-3 3v5.56A3.9 3.9 0 0 1 5 11h4a4 4 0 0 1 4 4v4a3.9 3.9 0 0 1-.56 2H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 6a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L15.59 7H15a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </Svg>
  );
}
