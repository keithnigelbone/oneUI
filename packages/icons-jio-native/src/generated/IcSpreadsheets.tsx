import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSpreadsheets(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.5 10h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M19.5 10h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M10.5 16h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M19.5 16h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M10.5 4h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5M19.5 4h-6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5"
          />
    </Svg>
  );
}
