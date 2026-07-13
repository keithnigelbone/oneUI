import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJiopay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M22 12c0 5.523-4.477 10-10 10-4.478 0-8.268-2.943-9.542-7H6a1 1 0 100-2H2.05a10.118 10.118 0 010-2H14a1 1 0 100-2H2.458c.22-.703.517-1.373.88-2H11a1 1 0 100-2H4.859A9.97 9.97 0 0112 2c5.523 0 10 4.477 10 10z'
                fill='currentColor'
              />
    </Svg>
  );
}
