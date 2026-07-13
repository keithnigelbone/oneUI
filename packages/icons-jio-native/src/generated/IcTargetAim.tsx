import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTargetAim(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m9 1.5h-1.07A8 8 0 0 0 13 4.07V3a1 1 0 0 0-2 0v1.07A8 8 0 0 0 4.07 11H3a1 1 0 0 0 0 2h1.07A8 8 0 0 0 11 19.93V21a1 1 0 0 0 2 0v-1.07A8 8 0 0 0 19.93 13H21a1 1 0 0 0 0-2m-4 2h.91A6 6 0 0 1 13 17.91V17a1 1 0 0 0-2 0v.91A6 6 0 0 1 6.09 13H7a1 1 0 0 0 0-2h-.91A6 6 0 0 1 11 6.09V7a1 1 0 0 0 2 0v-.91A6 6 0 0 1 17.91 11H17a1 1 0 0 0 0 2"
          />
    </Svg>
  );
}
