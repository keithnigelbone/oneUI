import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStretching(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m1.84-4C11.26 3.11 7.06 6.54 5 20.86A1 1 0 0 0 5.86 22H6a1 1 0 0 0 1-.86A58 58 0 0 1 8.18 15l2.94 5.48a1 1 0 0 0 1.76-.94L9.38 13h.67a2.998 2.998 0 0 0 2.78-4.11l-.81-2A10 10 0 0 1 18.16 4a1.013 1.013 0 0 0-.32-2m-7 8.55a1 1 0 0 1-.82.44h-.54q.485-1.178 1.14-2.27l.35.9a1 1 0 0 1-.1.94z"
          />
    </Svg>
  );
}
