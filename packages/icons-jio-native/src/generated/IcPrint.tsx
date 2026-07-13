import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPrint(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 6h-1V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-3 14H7v-7h10zm0-14H7V4h10zM9 16h6a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2m0 3h6a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2"
          />
    </Svg>
  );
}
