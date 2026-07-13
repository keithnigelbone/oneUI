import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHand(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.43 10.09c-.45-.21-.98-.06-1.26.35L16.46 13a.25.25 0 0 1-.46-.14V5c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V3c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7c0-.55-.45-1-1-1s-1 .45-1 1v7.99c0 3.71 2.88 6.93 6.59 7.01 3.06.06 5.72-1.88 6.6-4.8l1.77-5.91a1 1 0 0 0-.53-1.19z"
          />
    </Svg>
  );
}
