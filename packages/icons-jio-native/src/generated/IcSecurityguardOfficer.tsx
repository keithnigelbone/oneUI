import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSecurityguardOfficer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m14.47 12.39-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M10 20H8a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2m6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M7.29 4.71A1 1 0 0 0 8 5h8a1 1 0 0 0 .71-.29l1-1a1 1 0 0 0 .21-1.09A1 1 0 0 0 17 2H7a1 1 0 0 0-.92.62 1 1 0 0 0 .21 1.09zM12 11a4.48 4.48 0 0 0 4.45-4h-8.9A4.48 4.48 0 0 0 12 11"
          />
    </Svg>
  );
}
