import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGoForward10(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 12a1 1 0 0 0-1 1 6 6 0 1 1-6.44-6l-.27.27a1 1 0 0 0 .325 1.64 1 1 0 0 0 1.095-.22l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.32.31A8 8 0 1 0 20 13a1 1 0 0 0-1-1m-5.5-1a1.5 1.5 0 0 0-1.5 1.5v1a1.5 1.5 0 1 0 3 0v-1a1.5 1.5 0 0 0-1.5-1.5m.5 2.5a.5.5 0 1 1-1 0v-1a.5.5 0 0 1 1 0zM10.5 15a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.31-.46.47.47 0 0 0-.54.11l-1 1a.495.495 0 1 0 .7.7l.15-.14v1.79a.5.5 0 0 0 .5.5"
          />
    </Svg>
  );
}
