import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPercentageDecrease(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.996 9.001a2.99 2.99 0 0 0 2.769-1.852 3.004 3.004 0 0 0-2.184-4.09 2.99 2.99 0 0 0-3.076 1.275 3.003 3.003 0 0 0 2.491 4.667m10.987 6a2.99 2.99 0 0 0-2.768 1.852 3 3 0 0 0 .65 3.27A2.994 2.994 0 0 0 20.978 18a3 3 0 0 0-2.996-3m-12.984 6h3.995a.998.998 0 0 0 .706-1.707A1 1 0 0 0 8.994 19H7.306L20.71 4.681a1 1 0 0 0 0-1.41 1 1 0 0 0-.73-.27 1 1 0 0 0-.729.32L5.998 17.471v-1.47a1 1 0 0 0-1-1 1 1 0 0 0-.998 1v4a1 1 0 0 0 .999 1"
          />
    </Svg>
  );
}
