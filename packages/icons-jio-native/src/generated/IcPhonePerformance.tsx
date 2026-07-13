import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhonePerformance(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.12 2.88A3 3 0 0 0 15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12m-4.24 16.75A1.22 1.22 0 0 1 12 20a1.25 1.25 0 0 1-1.15-.77 1.27 1.27 0 0 1-.08-.72 1.3 1.3 0 0 1 1-1 1.27 1.27 0 0 1 1.279.539 1.25 1.25 0 0 1 .113 1.175 1.2 1.2 0 0 1-.282.406m2.83-9.92-3 3a1 1 0 0 1-1.42 0L10 11.41l-.29.3a1.004 1.004 0 1 1-1.42-1.42l1-1a1 1 0 0 1 1.42 0l1.29 1.3 2.29-2.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </Svg>
  );
}
