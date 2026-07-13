import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMason(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.27 2.73a2.52 2.52 0 0 0-3.54 0l-1.5 1.5a2.51 2.51 0 0 0-.56 2.68l-1.38 1.38a1 1 0 0 0-.24 1l.81 2.41-1.65 1.65-1.8-1.79a2 2 0 0 0-2.82 0l-1 1A2 2 0 0 0 5 13.67l-1 6A2 2 0 0 0 6 22q.165.015.33 0l6-1a2 2 0 0 0 1.08-.56l1-1a2 2 0 0 0 0-2.82l-1.79-1.8 2.09-2.08a1 1 0 0 0 .24-1l-.81-2.41.95-.94c.294.09.603.128.91.11a2.5 2.5 0 0 0 1.77-.73l1.5-1.5a2.52 2.52 0 0 0 0-3.54"
          />
    </Svg>
  );
}
