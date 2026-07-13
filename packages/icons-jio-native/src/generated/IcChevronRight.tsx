import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronRight(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 17a1 1 0 0 1-1.006-1 1 1 0 0 1 .296-.71l3.3-3.29-3.3-3.29a1.004 1.004 0 0 1 1.42-1.42l4 4a1 1 0 0 1 .219 1.095 1 1 0 0 1-.22.325l-4 4A1 1 0 0 1 10 17"
          />
    </Svg>
  );
}
