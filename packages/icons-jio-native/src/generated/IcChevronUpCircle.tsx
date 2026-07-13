import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronUpCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4.71 12.21a1 1 0 0 1-1.42 0L12 10.91l-3.29 3.3a1.005 1.005 0 0 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
