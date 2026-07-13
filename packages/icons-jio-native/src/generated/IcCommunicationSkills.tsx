import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCommunicationSkills(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3v2a1 1 0 0 0 .54.89c.143.07.3.108.46.11a1 1 0 0 0 .58-.19L11.52 18H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 8a3 3 0 0 1-3 3 1 1 0 0 1 0-2 1 1 0 0 0 1-1 2.007 2.007 0 0 1 .34-4A2.08 2.08 0 0 1 11 9.11zm6 0a3 3 0 0 1-3 3 1 1 0 0 1 0-2 1 1 0 0 0 1-1 2.007 2.007 0 0 1 .34-4A2.08 2.08 0 0 1 17 9.11z"
          />
    </Svg>
  );
}
