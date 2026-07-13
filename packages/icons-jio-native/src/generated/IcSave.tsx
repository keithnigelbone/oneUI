import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSave(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 11a1 1 0 0 0 1-1V8a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1m6.12-3.88-3.24-3.24A3 3 0 0 0 14.76 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9.24a3 3 0 0 0-.88-2.12M16 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6h8z"
          />
    </Svg>
  );
}
