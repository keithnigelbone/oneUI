import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCopyDocument(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12.33 8.82V6H4.87A1.88 1.88 0 0 0 3 7.88v12.24A1.88 1.88 0 0 0 4.87 22h10.26A1.88 1.88 0 0 0 17 20.12v-9.41h-2.8a1.88 1.88 0 0 1-1.87-1.89m8.08-3.23-3-3A2 2 0 0 0 16 2H8a2 2 0 0 0-2 2h7a3 3 0 0 1 2.12.88l3 3A3 3 0 0 1 19 10v9a2 2 0 0 0 2-2V7a2 2 0 0 0-.59-1.41"
          />
    </Svg>
  );
}
