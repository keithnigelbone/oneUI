import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcShoppingBag(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 6h-2a4 4 0 1 0-8 0H6a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2m-8 0a2 2 0 1 1 4 0z"
          />
    </Svg>
  );
}
