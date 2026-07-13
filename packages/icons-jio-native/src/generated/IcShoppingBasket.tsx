import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcShoppingBasket(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.57 9.76A2 2 0 0 0 20 9h-1.4l-2.74-4.51a1 1 0 0 0-1.72 1L16.23 9H7.77l2.09-3.49a1 1 0 0 0-1.72-1L5.43 9H4a2 2 0 0 0-1.98 2.44l1.42 6.22a3 3 0 0 0 3 2.34h11.1a3 3 0 0 0 3-2.34L22 11.44a2 2 0 0 0-.43-1.68"
          />
    </Svg>
  );
}
