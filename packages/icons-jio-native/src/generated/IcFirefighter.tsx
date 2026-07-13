import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFirefighter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11c3.87 0 7-1.34 7-3 0-.94-1-1.78-2.58-2.33a4.5 4.5 0 0 0-8.84 0C6 6.22 5 7.06 5 8c0 1.66 3.13 3 7 3m0-7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m2.47 8.39-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M16 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
