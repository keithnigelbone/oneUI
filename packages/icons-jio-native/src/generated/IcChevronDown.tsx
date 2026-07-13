import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronDown(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a1 1 0 0 1-.71-.29l-4-4a1.004 1.004 0 1 1 1.42-1.42l3.29 3.3 3.29-3.3a1.004 1.004 0 1 1 1.42 1.42l-4 4A1 1 0 0 1 12 15"
          />
    </Svg>
  );
}
