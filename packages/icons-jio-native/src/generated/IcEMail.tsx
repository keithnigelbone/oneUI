import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEMail(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m12.59 11.34 8-5.85A3 3 0 0 0 19 5H5a3 3 0 0 0-1.63.49l8 5.85a1 1 0 0 0 1.22 0m9.25-4.26L13.76 13a3 3 0 0 1-3.52 0L2.16 7.08A2.8 2.8 0 0 0 2 8v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a2.8 2.8 0 0 0-.16-.92"
          />
    </Svg>
  );
}
