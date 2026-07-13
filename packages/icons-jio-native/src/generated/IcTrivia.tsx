import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrivia(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v-5a5 5 0 0 1 5-5zm3 2h-8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-2.28 9a.5.5 0 0 1-.67-.23l-.11-.22h-1.88l-.11.22a.502.502 0 0 1-.9-.44l1.5-3a.52.52 0 0 1 .9 0l1.5 3a.51.51 0 0 1-.23.67m-2.16-1.5h.88l-.44-.88z"
          />
    </Svg>
  );
}
