import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFamilyHistory(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.12 6.88A3 3 0 0 0 19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-.88-2.12M13 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M8 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m7 8H6a1 1 0 0 1-1-1 3 3 0 0 1 5.5-1.65A3 3 0 0 1 16 16a1 1 0 0 1-1 1"
          />
    </Svg>
  );
}
