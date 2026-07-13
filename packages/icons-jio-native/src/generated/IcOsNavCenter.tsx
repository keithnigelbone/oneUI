import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOsNavCenter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path fill={fill} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />
    </Svg>
  );
}
