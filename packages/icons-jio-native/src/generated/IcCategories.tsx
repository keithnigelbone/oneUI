import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCategories(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 6h9a1 1 0 1 0 0-2h-9a1 1 0 1 0 0 2M6 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 10H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m14-6h-9a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2m0 6h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2m0 4h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
