import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoctor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 12 11m2.47 1.39-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M17 18.5h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
