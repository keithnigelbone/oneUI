import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNetworkDish(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.94 8.47Q16 8.24 16 8a2 2 0 0 0-2-2q-.24 0-.47.06L9.77 2.29a1 1 0 0 0-1.42 0 8 8 0 0 0-1.69 8.86 2.94 2.94 0 0 0 .42 4.13L5.31 20H5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-.54l-1.6-4.66a8 8 0 0 0 8.85-1.69 1 1 0 0 0 0-1.42zM7.44 20 9 16l1.38 4zM14 4a4 4 0 0 1 4 4 1 1 0 0 0 2 0 6 6 0 0 0-6-6 1 1 0 1 0 0 2"
          />
    </Svg>
  );
}
