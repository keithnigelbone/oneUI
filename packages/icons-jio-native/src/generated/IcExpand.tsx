import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcExpand(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.111 4h-5.333c-.534 0-.89.356-.89.889s.356.889.89.889h4.444v4.444c0 .534.356.89.89.89.532 0 .888-.356.888-.89V4.89c0-.533-.356-.889-.889-.889M10.222 18.222H5.778v-4.444c0-.534-.356-.89-.89-.89-.532 0-.888.356-.888.89v5.333c0 .533.356.889.889.889h5.333c.534 0 .89-.356.89-.889s-.356-.889-.89-.889"
          />
    </Svg>
  );
}
