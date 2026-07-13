import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChestPain(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 5h-3V4c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v1H6C3.79 5 2 6.79 2 9v1c0 .55.45 1 1 1h3v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-8h3c.55 0 1-.45 1-1V9c0-2.21-1.79-4-4-4m-2.55 6.11c.29.14.49.42.54.73.05.32-.05.64-.28.87l-2 2c-.2.2-.45.29-.71.29s-.51-.1-.71-.29a.996.996 0 0 1 0-1.41l1.02-1.02-.76-.38a.99.99 0 0 1-.54-.73c-.05-.32.05-.64.28-.87l2-2a.996.996 0 1 1 1.41 1.41l-1.02 1.02.76.38z"
          />
    </Svg>
  );
}
