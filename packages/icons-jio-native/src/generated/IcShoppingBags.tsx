import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcShoppingBags(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 6h-1a4 4 0 1 0-8 0H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h1.56A3.9 3.9 0 0 1 8 20v-5a4 4 0 0 1 2.28-3.6 5 5 0 0 1 9.44 0c.09.05.19.09.28.15V9a3 3 0 0 0-3-3m-7 0a2 2 0 1 1 4 0zm8 7a3 3 0 0 0-6 0 2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m-4 0a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
