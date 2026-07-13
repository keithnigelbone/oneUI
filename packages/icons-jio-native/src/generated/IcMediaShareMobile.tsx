import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMediaShareMobile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.5 12a1.6 1.6 0 0 0-.44.07l-2.62-1.57 2.62-1.57q.215.065.44.07A1.5 1.5 0 1 0 18 7.22l-1.16.69-1.9 1.16A1.6 1.6 0 0 0 14.5 9a1.5 1.5 0 0 0 0 3 1.6 1.6 0 0 0 .44-.07l1.93 1.16 1.16.69A1.501 1.501 0 1 0 19.5 12m-6.8 1.5a3.5 3.5 0 0 1 0-6l5-3q.117-.06.24-.11A3 3 0 0 0 15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2.35a2 2 0 0 1-.3-.15zM12 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
