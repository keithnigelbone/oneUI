import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScheduledDoctorConsultation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.12 3.88A3 3 0 0 0 18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-.88-2.12m-4.58 13.66a5 5 0 0 1-8.16-1.63A4.93 4.93 0 0 1 7.1 13 5 5 0 0 1 11 9.1a4.93 4.93 0 0 1 2.89.28 5 5 0 0 1 1.63 8.16zM19 7H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1zm-5 6h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
