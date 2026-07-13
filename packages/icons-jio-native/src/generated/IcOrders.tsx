import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOrders(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m14.54 3.88-2.19-.82a1.05 1.05 0 0 0-.7 0L4 5.93l2.66 1zm-6.91 9.34a1 1 0 0 1-2 0V8.68L3 7.69V17a1 1 0 0 0 .65.94L11 20.69v-10L7.63 9.43zm9.73-8.28L9.48 8l2.52.93 8-3zM13 10.69v10l7.35-2.75A1 1 0 0 0 21 17V7.69z"
          />
    </Svg>
  );
}
