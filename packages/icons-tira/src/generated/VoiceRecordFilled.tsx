import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const VoiceRecordFilled = forwardRef<SVGSVGElement, IconComponentProps>(function VoiceRecordFilled(
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
      <path d="M11.9998 2C9.51447 2 7.49976 4.01472 7.49976 6.5V11.5C7.49976 13.9853 9.51447 16 11.9998 16C14.485 16 16.4998 13.9853 16.4998 11.5V6.5C16.4998 4.01472 14.485 2 11.9998 2Z" fill="currentColor"/>
      <path d="M19.3998 10.3999C19.7311 10.3999 19.9998 10.6685 19.9998 10.9999C19.9998 13.1216 19.1569 15.1564 17.6566 16.6567C16.2983 18.015 14.5018 18.8344 12.5993 18.9773C12.5996 18.9848 12.5997 18.9923 12.5997 18.9999V21.4999C12.5997 21.8313 12.3311 22.0999 11.9997 22.0999C11.6684 22.0999 11.3997 21.8313 11.3997 21.4999V18.9999C11.3997 18.9923 11.3999 18.9848 11.4002 18.9773C9.4978 18.8343 7.70139 18.0149 6.34311 16.6567C4.84284 15.1564 4 13.1216 4 10.9999C4 10.6685 4.26863 10.3999 4.6 10.3999C4.93137 10.3999 5.2 10.6685 5.2 10.9999C5.2 12.8033 5.91641 14.5329 7.19164 15.8081C8.46686 17.0834 10.1964 17.7998 11.9999 17.7998C13.8033 17.7998 15.5329 17.0834 16.8081 15.8081C18.0833 14.5329 18.7998 12.8033 18.7998 10.9999C18.7998 10.6685 19.0684 10.3999 19.3998 10.3999Z" fill="currentColor"/>
      <path d="M16.4998 7.3999H12.9998C12.6684 7.3999 12.3998 7.66853 12.3998 7.9999C12.3998 8.33127 12.6684 8.5999 12.9998 8.5999H16.4998V7.3999Z" fill="white"/>
      <path d="M16.4998 10.3999H11.4998C11.1684 10.3999 10.8998 10.6685 10.8998 10.9999C10.8998 11.3313 11.1684 11.5999 11.4998 11.5999H16.4998V10.3999Z" fill="white"/>
    </svg>
  );
});

VoiceRecordFilled.displayName = 'VoiceRecordFilled';
