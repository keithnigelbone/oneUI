import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWaterSensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.67 4.56a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44m-6 5.82a.9.9 0 0 0-1.47 0l-2.73 4.54a5.35 5.35 0 0 0-.78 2.78 4.3 4.3 0 1 0 8.59 0c0-.982-.273-1.945-.79-2.78zM9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59"
          />
    </Svg>
  );
}
