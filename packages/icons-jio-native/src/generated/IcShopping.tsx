import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcShopping(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.48 7.65A2 2 0 0 0 18 7h-2V6a4 4 0 1 0-8 0v1H6a2 2 0 0 0-2 2.18l1 11a2 2 0 0 0 .65 1.3A2 2 0 0 0 7 22h10a2 2 0 0 0 1.35-.52 2 2 0 0 0 .65-1.3l1-11a2.001 2.001 0 0 0-.52-1.53M14 7h-4V6a2 2 0 1 1 4 0z"
          />
    </Svg>
  );
}
