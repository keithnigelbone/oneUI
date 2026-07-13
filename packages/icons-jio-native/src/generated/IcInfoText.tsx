import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcInfoText(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 19h-4V9c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h4v9H7c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1M12 6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3s-1.5.67-1.5 1.5S11.17 6 12 6"
          />
    </Svg>
  );
}
