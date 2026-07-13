import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMagic(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 10a1 1 0 0 0 .58-.19l7-5a1 1 0 1 0-1.16-1.62l-7 5A1 1 0 0 0 12 10m7 1H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5H6zM5.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
          />
    </Svg>
  );
}
