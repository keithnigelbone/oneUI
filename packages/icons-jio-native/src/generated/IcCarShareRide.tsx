import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCarShareRide(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.5 17c-.189 0-.375.038-.55.11L17.74 16 20 14.89c.174.072.361.11.55.11a1.5 1.5 0 1 0-1.44-1.9l-3 1.51a1.5 1.5 0 0 0-.55-.11 1.5 1.5 0 0 0 0 3c.189 0 .375-.038.55-.11l3 1.51A1.5 1.5 0 1 0 20.5 17m-14-9.31a1 1 0 0 1 1-.69h9.15a1 1 0 0 1 1 .68l.63 2.32h2.11l-1-2.95a3 3 0 0 0-2.84-2H7.41a3 3 0 0 0-2.85 2.02l-1.34 4.09A2 2 0 0 0 2 13v3a2 2 0 0 0 1 1.72V19a1 1 0 1 0 2 0v-1h7v-5a3 3 0 0 1 .78-2h-7.4zM5.8 13c.195-.038.397-.017.58.06a1 1 0 1 1-1.3 1.3A1 1 0 0 1 5 13.8a1 1 0 0 1 .8-.8"
          />
    </Svg>
  );
}
