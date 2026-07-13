import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProfileMale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.78 10.84a4.51 4.51 0 0 0 5.56-5.56 4.46 4.46 0 0 0-3.12-3.12 4.51 4.51 0 0 0-5.56 5.56 4.46 4.46 0 0 0 3.12 3.12M12 12a8 8 0 0 0-8 8 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-8-8"
          />
    </Svg>
  );
}
