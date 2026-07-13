import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWarning(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 4.5a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0zm1 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
