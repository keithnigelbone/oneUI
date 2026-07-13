import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRepeat(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 12a5 5 0 0 1 5-5h3.59l-.3.29a1 1 0 0 0 .326 1.64 1 1 0 0 0 1.094-.22l2-2a1 1 0 0 0 .21-.33 1 1 0 0 0 0-.76 1 1 0 0 0-.21-.33l-2-2a1.004 1.004 0 1 0-1.42 1.42l.3.29H9a7 7 0 0 0-7 7 6.94 6.94 0 0 0 2.59 5.43 1 1 0 1 0 1.26-1.55A5 5 0 0 1 4 12m15.41-5.43a.999.999 0 1 0-1.26 1.55A5 5 0 0 1 15 17h-3.59l.3-.29a1.004 1.004 0 1 0-1.42-1.42l-2 2a1 1 0 0 0-.21.33 1 1 0 0 0 0 .76 1 1 0 0 0 .21.33l2 2a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-.3-.29H15a7 7 0 0 0 7-7 6.94 6.94 0 0 0-2.59-5.43"
          />
    </Svg>
  );
}
