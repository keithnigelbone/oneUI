import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCollapse(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.059 9.647h-4.706V4.941c0-.565-.377-.941-.941-.941-.565 0-.941.376-.941.941v5.647c0 .565.376.941.94.941h5.648c.564 0 .941-.376.941-.94 0-.566-.377-.942-.941-.942M10.588 12.47H4.941c-.565 0-.941.377-.941.942 0 .564.376.94.941.94h4.706v4.707c0 .564.377.941.941.941.565 0 .941-.377.941-.941v-5.647c0-.565-.376-.941-.94-.941"
          />
    </Svg>
  );
}
