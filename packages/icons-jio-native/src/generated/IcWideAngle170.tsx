import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWideAngle170(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4.89 11a1 1 0 0 0 .71-.3A8.9 8.9 0 0 1 12 8a8.7 8.7 0 0 1 4.05 1H16a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1V7.41a1 1 0 1 0-2 0v.4A10.89 10.89 0 0 0 4.17 9.3a1 1 0 0 0 0 1.41 1 1 0 0 0 .72.29m17 1.51a1 1 0 0 0-1.36-.38L12 16.86l-8.51-4.73a1.004 1.004 0 0 0-1 1.74l9 5a1 1 0 0 0 1 0l9-5a1 1 0 0 0 .38-1.36z"
          />
    </Svg>
  );
}
