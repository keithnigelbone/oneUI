import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCategoriesSub(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m-1-8h9a1 1 0 1 0 0-2h-9a1 1 0 1 0 0 2M8 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm12 2h-9a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2m0 6h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2m0 4h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
