import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCropFree(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 6v9.76l2-2V6h7.76l2-2H6V3a1 1 0 0 0-2 0v1H3a1 1 0 0 0 0 2zm17 12h-1V6a2 2 0 0 0-.07-.51l.78-.78a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l.78-.78q.25.066.51.07h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m-3 0H7.41L18 7.41z"
          />
    </Svg>
  );
}
