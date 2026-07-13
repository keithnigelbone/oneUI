import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSampling(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3H5c-1.1 0-2 .9-2 2s.9 2 2 2v11c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V7c1.1 0 2-.9 2-2s-.9-2-2-2m-3 11c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"
          />
    </Svg>
  );
}
