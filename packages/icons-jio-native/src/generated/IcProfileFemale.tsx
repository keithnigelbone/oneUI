import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProfileFemale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 12a8 8 0 0 0-8 8 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-8-8m0-1a6 6 0 0 0 5.2-2.6l.3-.53-.41-.46a5.3 5.3 0 0 1-.9-1.67C15.79 4.45 15.05 2.05 12 2 9 2 8.22 4.45 7.83 5.74a5 5 0 0 1-.92 1.66l-.41.47.31.53A6 6 0 0 0 12 11"
          />
    </Svg>
  );
}
