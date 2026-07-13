import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAdblockPlus(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.46 4.68c-.34-.37-.8-.6-1.3-.66-2.2-.23-4.35-.85-6.34-1.83-.26-.13-.54-.19-.82-.19s-.56.07-.82.19c-1.97.98-4.11 1.6-6.3 1.83-.5.04-.97.27-1.32.64s-.55.85-.56 1.36v4.99C3 17.75 9.75 22 12 22s9-4.25 9-10.99V6.02c-.01-.5-.2-.97-.54-1.34m-4.92 9.44a.996.996 0 1 1-1.41 1.41l-2.12-2.12-2.12 2.12a.996.996 0 1 1-1.41-1.41L10.6 12 8.48 9.88a.996.996 0 1 1 1.41-1.41l2.12 2.12 2.12-2.12a.996.996 0 1 1 1.41 1.41L13.42 12z"
          />
    </Svg>
  );
}
