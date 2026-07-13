import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcApartmentComplex(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3H8a1 1 0 0 0 0 2v2H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h6.5v-5h3v5H18a2 2 0 0 0 2-2V5a1 1 0 1 0 0-2M8 17H6v-2h2zm0-4H6v-2h2zm5 0h-2v-2h2zm0-4h-2V7h2zm4 4h-2v-2h2zm0-4h-2V7h2z"
          />
    </Svg>
  );
}
