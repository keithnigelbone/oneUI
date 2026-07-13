import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignmentHorizontal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.71 11.29-3-3a.99.99 0 0 0-1.09-.22c-.37.15-.62.52-.62.92v2H7v-2c0-.4-.24-.77-.62-.92a.98.98 0 0 0-1.09.22l-3 3a.996.996 0 0 0 0 1.41l3 3c.19.19.45.29.71.29.13 0 .26-.02.38-.08.37-.15.62-.52.62-.92v-2h10v2c0 .4.24.77.62.92a.995.995 0 0 0 1.09-.21l3-3a.996.996 0 0 0 0-1.41"
          />
    </Svg>
  );
}
