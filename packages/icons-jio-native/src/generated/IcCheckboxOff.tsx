import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCheckboxOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path stroke="currentColor" d="M.5.5h23v23H.5z" />
    </Svg>
  );
}
