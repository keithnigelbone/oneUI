import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAccessibility(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 3c.83 0 1.5.67 1.5 1.5S12.83 8 12 8s-1.5-.67-1.5-1.5S11.17 5 12 5m5.24 4.97-3.74.94v1.86l2.39 4.79c.25.49.05 1.09-.45 1.34a1.007 1.007 0 0 1-1.35-.44l-2.11-4.21-2.11 4.21a1.007 1.007 0 0 1-1.35.44 1.01 1.01 0 0 1-.45-1.34l2.39-4.79v-1.86l-3.74-.94a1 1 0 0 1 .48-1.94l3.88.97h1.75l3.88-.97a.995.995 0 0 1 1.21.73.995.995 0 0 1-.73 1.21z"
          />
    </Svg>
  );
}
