import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHtml5(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.47 2.64A2 2 0 0 0 18 2H6a2 2 0 0 0-2 2.15l1 13a2 2 0 0 0 1 1.56l5 3a2 2 0 0 0 2.06 0l5-3a2 2 0 0 0 1-1.56l1-13a2 2 0 0 0-.59-1.51M13.5 16h-4a1 1 0 0 1 0-2h4a.91.91 0 0 0 1-1 .91.91 0 0 0-1-1h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H15a1 1 0 1 1 0 2h-4.5v2h3a2.91 2.91 0 0 1 3 3 2.91 2.91 0 0 1-3 3"
          />
    </Svg>
  );
}
