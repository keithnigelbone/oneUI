import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSecuritySensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.67 4.56a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44m-2.38 6.65a11.2 11.2 0 0 1-3.8-1.1 1.15 1.15 0 0 0-1 0c-1.184.59-2.464.963-3.78 1.1a1.22 1.22 0 0 0-.79.39 1.18 1.18 0 0 0-.33.81v3c0 4 4 6.59 5.39 6.59s5.39-2.55 5.39-6.59v-3a1.16 1.16 0 0 0-.32-.79 1.2 1.2 0 0 0-.76-.41M9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59"
          />
    </Svg>
  );
}
