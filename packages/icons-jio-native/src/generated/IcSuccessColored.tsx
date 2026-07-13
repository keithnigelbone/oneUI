import React from 'react';
import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';
export function IcSuccessColored(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={10} fill="#fff" />
          <Path
            fill="#25AB21"
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m5.21 7.71-6 6a1 1 0 0 1-1.42 0l-3-3a1.003 1.003 0 1 1 1.42-1.42l2.29 2.3 5.29-5.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </Svg>
  );
}
