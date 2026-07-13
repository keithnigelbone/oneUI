import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMail(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.7 6.46A2.66 2.66 0 0 0 17.34 5H6.67c-1.03 0-1.92.6-2.36 1.46l7.7 4.62 7.7-4.62z"
          />
          <Path
            fill={fill}
            d="M12.91 12.6a1.78 1.78 0 0 1-1.84.01L3.99 8.35v7.98c0 1.48 1.19 2.67 2.67 2.67h10.67c1.48 0 2.67-1.19 2.67-2.67V8.35l-7.08 4.25z"
          />
    </Svg>
  );
}
