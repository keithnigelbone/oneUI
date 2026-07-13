import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFolderMoveFiles(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-2.29 7.71-3 3a1.004 1.004 0 1 1-1.42-1.42l1.3-1.29H8a1 1 0 0 1 0-2h5.59l-1.3-1.29a1.002 1.002 0 0 1 .325-1.639 1 1 0 0 1 1.095.219l3 3a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
