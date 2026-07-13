import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTabManager(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3"
          />
          <Path
            fill="#fff"
            d="M12.643 16h-1.356V9.16q-.408.216-1.008.468a7 7 0 0 1-.96.348V8.788q.444-.144 1.14-.468t1.152-.612h1.032z"
          />
    </Svg>
  );
}
