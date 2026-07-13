import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDancing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m7.71.29a1 1 0 0 0-1.42 0l-2 2a1 1 0 0 1-1.15.19l-1.82-.91a3 3 0 0 0-2.68 0l-1.82.91a1 1 0 0 1-1.15-.19l-2-2a1 1 0 0 0-1.38 1.42l2 2a3 3 0 0 0 3.47.56L11 8.62v3.81l-3.06 1.84A4 4 0 0 0 6 17.7V21a1 1 0 1 0 2 0v-3.3A2 2 0 0 1 9 16l2.51-1.5 2.58 6.87A1 1 0 0 0 15 22a1 1 0 0 0 .684-.265 1 1 0 0 0 .256-1.085L13 12.82v-4.2l1.26.63c.42.208.882.317 1.35.32a3 3 0 0 0 2.12-.88l2-2a1 1 0 0 0-.02-1.4"
          />
    </Svg>
  );
}
