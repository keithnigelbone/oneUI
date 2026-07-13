import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCodeDocument(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.5 2H10a2 2 0 0 0-1.41.59l-3 3A2 2 0 0 0 5 7v12.5A2.5 2.5 0 0 0 7.5 22h10a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 17.5 2m-6.79 11.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-2-2a1 1 0 0 1 0-1.42l2-2a1.004 1.004 0 0 1 1.42 1.42L9.41 12zm7-.58-2 2a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.3-1.29-1.3-1.29a1.004 1.004 0 1 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
