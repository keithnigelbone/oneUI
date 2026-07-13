import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnalyticsPieChartTree(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.9 11H22a10 10 0 0 0-9-8.95V7.1a5 5 0 0 1 3.9 3.9M13 16.89V22a10 10 0 0 0 9-9h-5.1a5 5 0 0 1-3.9 3.89M2 12a10 10 0 0 0 9 10v-5.1a5 5 0 0 1 0-9.8v-5A10 10 0 0 0 2 12"
          />
    </Svg>
  );
}
