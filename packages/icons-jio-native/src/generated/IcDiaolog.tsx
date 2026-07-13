import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDiaolog(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 15a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3v1a1 1 0 0 0 .55.89A.9.9 0 0 0 6 17a1 1 0 0 0 .6-.2L9 15zM6 6.5h7a1 1 0 1 1 0 2H6a1 1 0 0 1 0-2m2 6H6a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2M19 8h-.09v4A4.91 4.91 0 0 1 14 16.91H9.78L8 18.24a3 3 0 0 0 2 .76h5l2.4 1.8a1 1 0 0 0 .6.2.9.9 0 0 0 .45-.11A1 1 0 0 0 19 20v-1a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
