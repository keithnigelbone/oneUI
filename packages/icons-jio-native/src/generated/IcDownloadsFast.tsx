import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownloadsFast(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m2.8 10.6-3 4a.999.999 0 1 1-1.6-1.2L12 13h-2a1 1 0 0 1-.8-1.6l3-4a1 1 0 1 1 1.6 1.2L12 11h2a1 1 0 0 1 .8 1.6"
          />
    </Svg>
  );
}
