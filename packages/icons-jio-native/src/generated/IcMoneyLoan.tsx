import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoneyLoan(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.49 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.71 14.89a.98.98 0 0 0-1.41 0l-2.53 2.53c-.38.38-.88.59-1.41.59h-3.35c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1-.45 1-1s-.45-1-1-1h-4c-1.1 0-2 .9-2 2h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h9.35c1.07 0 2.07-.42 2.83-1.17l2.53-2.53a.996.996 0 0 0 0-1.41z"
          />
    </Svg>
  );
}
