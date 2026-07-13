import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmileyHappy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m8.58 7.16a5.8 5.8 0 0 1-.78 1 .5.5 0 0 1-.06.09 5.6 5.6 0 0 1-.7.59 5.8 5.8 0 0 1-1.95.94h-.16a5 5 0 0 1-.53.11h-1.78a5 5 0 0 1-.53-.11h-.16a5.8 5.8 0 0 1-1.95-.94 5.6 5.6 0 0 1-.7-.59.5.5 0 0 1-.06-.09 5.8 5.8 0 0 1-.78-1 1 1 0 1 1 1.67-1.06q.275.44.65.8.224.211.48.38l.1.07a4.14 4.14 0 0 0 4.32 0l.1-.07q.257-.169.48-.38a4.2 4.2 0 0 0 .65-.8 1 1 0 1 1 1.69 1.06"
          />
    </Svg>
  );
}
