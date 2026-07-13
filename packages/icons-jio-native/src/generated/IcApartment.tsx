import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcApartment(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3H4a1 1 0 0 0 0 2v14a2 2 0 0 0 2 2h4v-5h4v5h4a2 2 0 0 0 2-2V5a1 1 0 1 0 0-2M9 13H7v-2h2zm0-4H7V7h2zm4 4h-2v-2h2zm0-4h-2V7h2zm4 4h-2v-2h2zm0-4h-2V7h2z"
          />
    </Svg>
  );
}
