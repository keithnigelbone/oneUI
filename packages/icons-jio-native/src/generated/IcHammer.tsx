import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHammer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.71 11.29-.71-.7a2 2 0 0 0-1.41-.59H19a3 3 0 0 0-.7-3.12l-3.59-3.59a3.84 3.84 0 0 0-5.42 0 1 1 0 0 0 0 1.42l1 1a1.81 1.81 0 0 1 0 2.58 1 1 0 0 0 0 1.42l2.59 2.58A3 3 0 0 0 16 13v.6a2 2 0 0 0 .59 1.4l.7.71a1 1 0 0 0 1.42 0l3-3a1 1 0 0 0 0-1.42m-12.26.4-5.86 5.85A2 2 0 0 0 4.75 21H5a2 2 0 0 0 1.49-.66l5.56-6.11a6 6 0 0 1-.62-.52z"
          />
    </Svg>
  );
}
