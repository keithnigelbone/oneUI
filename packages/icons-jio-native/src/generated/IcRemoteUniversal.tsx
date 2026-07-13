import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRemoteUniversal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4.12-12.12A3 3 0 0 0 14 2h-4a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M10 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m2 11a3 3 0 1 1 0-5.999A3 3 0 0 1 12 19m2-9a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
