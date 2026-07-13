import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRecentHistory(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 14a1 1 0 0 0 0-2h-2V9a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1zm3.86-7.43a2 2 0 0 0-.15-.23A8 8 0 0 0 12.05 4H12a8 8 0 0 0-8 7.61l-.31-.32a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 .22.14q.05.045.11.07A1 1 0 0 0 5 15a.9.9 0 0 0 .37-.07l.11-.07a.9.9 0 0 0 .2-.13l2-1.88a1 1 0 0 0 .05-1.41 1 1 0 0 0-1.41 0l-.25.23A6 6 0 0 1 12 6a6 6 0 1 1 0 12 1 1 0 0 0 0 2 7.999 7.999 0 0 0 5.86-13.43"
          />
    </Svg>
  );
}
