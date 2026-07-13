import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRegularSensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.67 4.56a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44M9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59M12 10a6 6 0 1 0 0 12.001 6 6 0 0 0 0-12m0 8a2 2 0 1 1 0-3.999 2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
