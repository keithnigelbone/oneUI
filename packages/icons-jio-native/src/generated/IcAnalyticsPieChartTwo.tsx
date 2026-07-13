import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnalyticsPieChartTwo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.72 5.66-3.57 3.57a5 5 0 1 1-8.35 0L4.23 5.66a10 10 0 1 0 15.49 0m-5 2.16 3.58-3.57a10 10 0 0 0-12.65 0l3.57 3.57a5 5 0 0 1 5.51 0z"
          />
    </Svg>
  );
}
