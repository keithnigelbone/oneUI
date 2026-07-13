import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnalyticsData(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11.5a1 1 0 0 0 0-2 2.5 2.5 0 0 0 0 5 1 1 0 0 0 0-2 .5.5 0 0 1 0-1m-4.24 3.33a1 1 0 0 0 0 1.41A5.93 5.93 0 0 0 12 18a6 6 0 1 0 0-12 5.93 5.93 0 0 0-4.24 1.76 1 1 0 0 0 1.41 1.41 4 4 0 1 1 0 5.66 1 1 0 0 0-1.41 0M12 2a1 1 0 1 0 0 2 8 8 0 1 1-8 8 1 1 0 1 0-2 0A10 10 0 1 0 12 2"
          />
    </Svg>
  );
}
