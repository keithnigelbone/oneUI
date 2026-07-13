import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAcRemote(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2m2-5h-4a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-4 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-2-5a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11"
          />
    </Svg>
  );
}
