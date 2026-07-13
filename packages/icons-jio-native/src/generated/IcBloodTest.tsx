import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBloodTest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 14.52a5.43 5.43 0 0 1 1.62-3.89L14 9.26V5h.5a1.5 1.5 0 0 0 0-3h-9a1.5 1.5 0 0 0 0 3H6v13a4 4 0 0 0 7.78 1.26A5.37 5.37 0 0 1 11 14.52M8 9V5h4v4zm11 3.05-1.76-1.76a1 1 0 0 0-1.42 0L14 12.05A3.48 3.48 0 0 0 14 17a3.51 3.51 0 0 0 5 0 3.4 3.4 0 0 0 1-2.46 3.46 3.46 0 0 0-1-2.49"
          />
    </Svg>
  );
}
