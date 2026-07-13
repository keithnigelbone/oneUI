import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKey(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.71 16.71-7.88-7.88c.112-.434.17-.881.17-1.33A5.5 5.5 0 1 0 7.5 13c.449 0 .896-.058 1.33-.17L10 14h2v2h2v2h2v2l.71.71a1 1 0 0 0 .7.29H20a1 1 0 0 0 1-1v-2.59a1 1 0 0 0-.29-.7M6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
