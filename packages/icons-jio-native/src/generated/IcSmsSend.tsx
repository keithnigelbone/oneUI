import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmsSend(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 4H9a7 7 0 0 0-1 13.92V20a1.5 1.5 0 0 0 2.4 1.2l4.27-3.2H15a7 7 0 0 0 0-14m3 8a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.004 1.004 0 1 1-1.42-1.42l2.3-2.29H14a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </Svg>
  );
}
