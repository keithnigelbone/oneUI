import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const BeforeAfterOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function BeforeAfterOutlined(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12.6004 2.50002C12.6004 2.16865 12.3318 1.90002 12.0004 1.90002C11.669 1.90002 11.4004 2.16865 11.4004 2.50002V21.5C11.4004 21.8314 11.669 22.1 12.0004 22.1C12.3318 22.1 12.6004 21.8314 12.6004 21.5V20.6H18.0004C19.4363 20.6 20.6004 19.436 20.6004 18V6.00002C20.6004 4.56408 19.4363 3.40002 18.0004 3.40002H12.6004V2.50002ZM12.6004 4.60002V19.4H18.0004C18.7736 19.4 19.4004 18.7732 19.4004 18V6.00002C19.4004 5.22683 18.7736 4.60002 18.0004 4.60002H12.6004Z" fill="currentColor"/>
      <path d="M6.00039 4.60002C5.22719 4.60002 4.60039 5.22683 4.60039 6.00002L4.60039 8.44447C4.60039 8.77584 4.33176 9.04447 4.00039 9.04447C3.66902 9.04447 3.40039 8.77584 3.40039 8.44447V6.00002C3.40039 4.56408 4.56445 3.40002 6.00039 3.40002L8.44484 3.40002C8.77621 3.40002 9.04484 3.66865 9.04484 4.00002C9.04484 4.3314 8.77621 4.60002 8.44484 4.60002L6.00039 4.60002Z" fill="currentColor"/>
      <path d="M4.60039 18C4.60039 18.7732 5.22719 19.4 6.00039 19.4H8.44484C8.77621 19.4 9.04484 19.6686 9.04484 20C9.04484 20.3313 8.77621 20.6 8.44484 20.6H6.00039C4.56445 20.6 3.40039 19.4359 3.40039 18V15.5555C3.40039 15.2242 3.66902 14.9555 4.00039 14.9555C4.33176 14.9555 4.60039 15.2242 4.60039 15.5555L4.60039 18Z" fill="currentColor"/>
    </svg>
  );
});

BeforeAfterOutlined.displayName = 'BeforeAfterOutlined';
