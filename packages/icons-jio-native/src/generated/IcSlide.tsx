import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSlide(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2 8v8a2 2 0 0 0 2 2h1V6H4a2 2 0 0 0-2 2m18-2h-1v12h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-5-2H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
