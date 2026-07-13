import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrainStatus(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 14h10a2 2 0 0 0 2-2V6a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v6a2 2 0 0 0 2 2m9-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-3-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM7 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zm1 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m11 10H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M8 16a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2z"
          />
    </Svg>
  );
}
