import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallData(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.16 14.32a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.42 0L9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13c-.18 1.4-.08 4.74 3.67 8.47s7.07 3.85 8.48 3.68a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83zm3.55-6a1 1 0 0 0-1.42 0l-.29.3V5a1 1 0 0 0-2 0v6a1 1 0 0 0 .62.92 1 1 0 0 0 1.09-.21l2-2a1 1 0 0 0 0-1.42zm-8-.58.29-.3V11a1 1 0 1 0 2 0V5a1 1 0 0 0-.62-.92 1 1 0 0 0-1.09.21l-2 2a1.004 1.004 0 1 0 1.42 1.42z"
          />
    </Svg>
  );
}
