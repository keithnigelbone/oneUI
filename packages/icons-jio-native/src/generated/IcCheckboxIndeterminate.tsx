import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCheckboxIndeterminate(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path fill={fill} d="M0 0h24v24H0z" />
          <Path
            fill="#fff"
            d="M3.293 11.293A1 1 0 0 1 4 11h16a1 1 0 0 1 0 2H4a1 1 0 0 1-.707-1.707"
          />
    </Svg>
  );
}
