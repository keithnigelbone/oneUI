import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScanPicture(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2M3 8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1m4 12H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2M6 7.25v9.5A1.25 1.25 0 0 0 7.25 18h9.5A1.25 1.25 0 0 0 18 16.75v-9.5A1.25 1.25 0 0 0 16.75 6h-9.5A1.25 1.25 0 0 0 6 7.25M8 8h8v4.09l-.79-.8a1 1 0 0 0-1.48.07l-1.8 2.16-1.22-1.23A1 1 0 0 0 10 12a1 1 0 0 0-.73.36L8 13.84zm11-6h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3m2 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
