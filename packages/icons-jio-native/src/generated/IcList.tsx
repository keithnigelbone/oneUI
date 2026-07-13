import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcList(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 17H9a1 1 0 0 0 0 2h11a1 1 0 0 0 0-2m0-6H9a1 1 0 0 0 0 2h11a1 1 0 0 0 0-2M9 7h11a1 1 0 1 0 0-2H9a1 1 0 0 0 0 2M4.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
