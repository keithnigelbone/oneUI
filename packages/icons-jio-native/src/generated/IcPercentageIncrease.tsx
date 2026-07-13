import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPercentageIncrease(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.983 15a2.99 2.99 0 0 0-2.768 1.852 3.002 3.002 0 0 0 2.183 4.09 2.99 2.99 0 0 0 3.076-1.275 3 3 0 0 0-.372-3.788 3 3 0 0 0-2.12-.879M5.996 9a2.99 2.99 0 0 0 2.769-1.852 3.003 3.003 0 0 0-2.184-4.09 2.99 2.99 0 0 0-3.076 1.275A3.003 3.003 0 0 0 5.996 9M18.98 3h-3.995a.998.998 0 0 0-.706 1.707 1 1 0 0 0 .706.293h1.688L3.27 19.32a1 1 0 0 0 0 1.41 1 1 0 0 0 .729.27 1 1 0 0 0 .729-.32L17.982 6.53V8a1 1 0 0 0 .999 1 1 1 0 0 0 .998-1V4a1 1 0 0 0-.998-1"
          />
    </Svg>
  );
}
