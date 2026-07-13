import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIp67(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 11h-.5v1H9a.5.5 0 0 0 0-1m3.5 1.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M6.5 13.5a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 1 0zM9 13h-.5v.5a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10h1a1.5 1.5 0 1 1 0 3m5.5-.5a1.5 1.5 0 1 1-3 0V12a2 2 0 0 1 2-2h.5a.5.5 0 0 1 0 1h-.5a.6.6 0 0 0-.18 0 1.49 1.49 0 0 1 1.18 1.5m3.95-1.78-1.5 3a.5.5 0 0 1-.9-.44L17.19 11H16a.5.5 0 0 1 0-1h2a.52.52 0 0 1 .43.24.51.51 0 0 1 .02.48"
          />
    </Svg>
  );
}
