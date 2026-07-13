import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSeekbar(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path fill={fill} d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12" />
    </Svg>
  );
}
