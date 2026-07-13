import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmokeSensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.61 16.77a1.002 1.002 0 0 0-1.22-1.59 4 4 0 0 1-4.78 0 1.002 1.002 0 1 0-1.22 1.59 5.91 5.91 0 0 0 7.22 0M17.33 18a8 8 0 0 1-10.66 0 1.002 1.002 0 0 0-1.34 1.49 10 10 0 0 0 13.34 0A1.002 1.002 0 0 0 17.33 18m2.43-15.6A1 1 0 0 0 19 2H5a1 1 0 0 0-.76.35 1 1 0 0 0-.24.81l.86 5.17a2 2 0 0 0 2 1.67h.43l.54 1.63A2 2 0 0 0 9.72 13h4.56a2 2 0 0 0 1.9-1.37l.54-1.63h.43a2 2 0 0 0 2-1.67L20 3.16a1 1 0 0 0-.24-.81z"
          />
    </Svg>
  );
}
