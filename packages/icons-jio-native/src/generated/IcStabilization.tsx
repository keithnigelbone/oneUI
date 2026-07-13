import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStabilization(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.67 4.29a5 5 0 0 1 3 3 1 1 0 0 0 .94.67 1 1 0 0 0 .39-.02 1 1 0 0 0 .6-1.27 6.93 6.93 0 0 0-4.26-4.26 1 1 0 1 0-.66 1.88zM3 7.94a1 1 0 0 0 1.29-.61 5 5 0 0 1 3-3 1 1 0 1 0-.66-1.88 6.93 6.93 0 0 0-4.22 4.22A1 1 0 0 0 3 7.94m4.33 11.77a5 5 0 0 1-3-3A1 1 0 0 0 3 16.06a1 1 0 0 0-.6 1.27 6.93 6.93 0 0 0 4.26 4.26q.16.058.33.06a1 1 0 0 0 .33-1.94zM18 15V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3m-6-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4m9 2.06a1 1 0 0 0-1.28.61 5 5 0 0 1-3 3 1 1 0 0 0 .28 1.98q.17-.002.33-.06a6.93 6.93 0 0 0 4.26-4.26 1 1 0 0 0-.59-1.27"
          />
    </Svg>
  );
}
