import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChemistry(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.64 17.25 16 9.21V5h1a1 1 0 1 0 0-2H7a1 1 0 0 0 0 2h1v4.21l-4.64 8a2.44 2.44 0 0 0 0 2.5A2.47 2.47 0 0 0 5.52 21h13a2.47 2.47 0 0 0 2.484-2.506 2.44 2.44 0 0 0-.364-1.244M12.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m3 2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
