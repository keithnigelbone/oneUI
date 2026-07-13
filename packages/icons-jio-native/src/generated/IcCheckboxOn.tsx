import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCheckboxOn(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path fill={fill} d="M0 0h24v24H0z" />
          <Path
            fill="#fff"
            d="M9 19a1 1 0 0 1-.71-.29l-5-5a1.004 1.004 0 1 1 1.42-1.42L9 16.59l10.29-10.3a1.004 1.004 0 1 1 1.42 1.42l-11 11A1 1 0 0 1 9 19"
          />
    </Svg>
  );
}
