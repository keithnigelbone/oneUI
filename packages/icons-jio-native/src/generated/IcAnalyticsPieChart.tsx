import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnalyticsPieChart(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 17a5 5 0 0 1-2-9.57V2.2A10 10 0 1 0 21.8 14h-5.23A5 5 0 0 1 12 17m2-5h8A10 10 0 0 0 12 2v8a2 2 0 0 0 2 2"
          />
    </Svg>
  );
}
