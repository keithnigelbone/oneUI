import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallGroup(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m4-1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0 1a3 3 0 0 0-2.53 1.4A3 3 0 0 0 11 11a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h3a1 1 0 0 0 1-1 3 3 0 0 0-3-3m-2.39 8.86a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0l-4.23-4.24a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1a2 2 0 0 0-.56 1.13c-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83z"
          />
    </Svg>
  );
}
