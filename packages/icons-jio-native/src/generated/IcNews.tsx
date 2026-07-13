import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNews(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 2h-9a3 3 0 0 0-3 3v13a1 1 0 1 1-2 0V8H4a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 15h-5a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2m2-5h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2m0-5h-7a1 1 0 1 1 0-2h7a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
