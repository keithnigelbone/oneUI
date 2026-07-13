import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJioDotJiofinanceColoured = forwardRef<SVGSVGElement, IconComponentProps>(function IcJioDotJiofinanceColoured(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <g clipPath="url(#ic_jio_dot_jiofinance_coloured_svg__a)">
            <rect
              width={24}
              height={24}
              fill="url(#ic_jio_dot_jiofinance_coloured_svg__b)"
              rx={12}
            />
            <path
              fill="#fff"
              d="M8.478 7.237h-.4c-.76 0-1.174.428-1.174 1.285v4.129c0 1.063-.359 1.436-1.201 1.436-.663 0-1.202-.29-1.63-.815-.041-.055-.91.36-.91 1.381 0 1.105 1.034 1.782 2.955 1.782 2.333 0 3.563-1.174 3.563-3.742V8.522c-.002-.856-.416-1.285-1.203-1.285m9.3 2.017c-2.265 0-3.77 1.436-3.77 3.577 0 2.196 1.45 3.605 3.728 3.605 2.265 0 3.756-1.409 3.756-3.59.001-2.156-1.477-3.592-3.714-3.592m-.028 5.15c-.884 0-1.491-.648-1.491-1.574 0-.91.622-1.56 1.491-1.56s1.491.65 1.491 1.574c0 .898-.634 1.56-1.49 1.56m-5.656-5.082h-.277c-.676 0-1.187.318-1.187 1.285v4.419c0 .98.497 1.285 1.215 1.285h.277c.676 0 1.16-.332 1.16-1.285v-4.42c0-.993-.47-1.284-1.188-1.284m-.152-3.203c-.856 0-1.395.484-1.395 1.243 0 .773.553 1.256 1.436 1.256.857 0 1.395-.483 1.395-1.256s-.552-1.243-1.436-1.243"
            />
          </g>
          <defs>
            <linearGradient
              id="ic_jio_dot_jiofinance_coloured_svg__b"
              x1={0.045}
              x2={24.027}
              y1={0.045}
              y2={24.027}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0.08} stopColor="#F3B561" />
              <stop offset={0.45} stopColor="#F6C586" />
              <stop offset={1} stopColor="#C78724" />
            </linearGradient>
            <clipPath id="ic_jio_dot_jiofinance_coloured_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
    </svg>
  );
});

IcJioDotJiofinanceColoured.displayName = 'IcJioDotJiofinanceColoured';
