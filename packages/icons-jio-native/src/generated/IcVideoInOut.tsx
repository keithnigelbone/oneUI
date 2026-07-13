import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoInOut(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.6 7.8-2.6 2V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2M5 14a1 1 0 0 1-.71-1.71L6.59 10H6a1 1 0 0 1 0-2h3a1 1 0 0 1 .92.62 1 1 0 0 1-.21 1.09l-4 4A1 1 0 0 1 5 14m7 2H9a1 1 0 0 1-.92-.62 1 1 0 0 1 .21-1.09l4-4a1.004 1.004 0 0 1 1.42 1.42L11.41 14H12a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
