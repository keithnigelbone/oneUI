import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPrimeContent(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2.93 17.3a3 3 0 0 0 3 2.7h12.15a3 3 0 0 0 3-2.7l.13-1.3H2.8zM21.74 7a2 2 0 0 0-2.09-1 2 2 0 0 0-1.07.56l-.86.85a1 1 0 0 1-.32.22 1 1 0 0 1-.38.07 1 1 0 0 1-.71-.3l-2.78-2.8a2 2 0 0 0-2.79 0l-3 2.92a1 1 0 0 1-.74.26 1 1 0 0 1-.7-.29l-.9-.9A2 2 0 0 0 4.36 6a2 2 0 0 0-2.11 1A2.07 2.07 0 0 0 2 8.2l.6 5.8h18.8l.6-5.8a2.06 2.06 0 0 0-.26-1.2"
          />
    </Svg>
  );
}
