import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmileyNeutral(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7 7.5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m1.5-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
