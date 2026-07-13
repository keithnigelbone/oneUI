import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNext(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 20a1 1 0 0 1-1.006-1 1 1 0 0 1 .296-.71l6.3-6.29-6.3-6.29a1.004 1.004 0 0 1 1.42-1.42l7 7a1 1 0 0 1 .219 1.095 1 1 0 0 1-.22.325l-7 7A1 1 0 0 1 9 20"
          />
    </Svg>
  );
}
