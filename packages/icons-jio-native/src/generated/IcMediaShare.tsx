import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMediaShare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m18.7 15.5-5-3a3.5 3.5 0 0 1 0-6L16.2 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2h-1.5a3.47 3.47 0 0 1-1.8-.5M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m5.5-8a1.6 1.6 0 0 0-.44.07L17.44 9.5l2.62-1.57q.215.065.44.07A1.5 1.5 0 1 0 19 6.22l-3.06 1.85A1.6 1.6 0 0 0 15.5 8a1.5 1.5 0 0 0 0 3 1.6 1.6 0 0 0 .44-.07L19 12.78A1.5 1.5 0 1 0 20.5 11"
          />
    </Svg>
  );
}
