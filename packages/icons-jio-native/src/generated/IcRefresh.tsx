import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRefresh(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 4a8 8 0 0 1 3.85 1H15a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v.36A10 10 0 0 0 12 2a10 10 0 0 0-8.65 5A9.94 9.94 0 0 0 2 12a1 1 0 1 0 2 0 8 8 0 0 1 8-8m9.71 7.29A1 1 0 0 0 20 12a8 8 0 0 1-11.84 7H9a1 1 0 0 0 0-2H6a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0v-.36A10 10 0 0 0 12 22a10 10 0 0 0 10-10 1 1 0 0 0-.29-.71"
          />
    </Svg>
  );
}
