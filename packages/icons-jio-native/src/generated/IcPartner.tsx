import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPartner(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.5 8.61a1.49 1.49 0 0 0-1-2.61 1.7 1.7 0 0 0-.51.09l-5.54-2.95a1.49 1.49 0 0 0-2.9 0L5 6.09a1.49 1.49 0 0 0-1.5 2.52v6.78A1.49 1.49 0 0 0 5 17.91l5.54 2.95a1.49 1.49 0 0 0 2.9 0L19 17.91q.249.084.51.09a1.49 1.49 0 0 0 1-2.61zM12 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8h-4a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1"
          />
    </Svg>
  );
}
