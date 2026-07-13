import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const AttachmentOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function AttachmentOutlined(
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
      <path d="M12.2839 5.2121C14.0803 3.41572 16.9924 3.4157 18.7888 5.2121C20.5851 7.00851 20.5851 9.92061 18.7888 11.717L14.5466 15.9601C14.3124 16.1944 13.9323 16.1941 13.698 15.9601C13.4637 15.7258 13.4637 15.3458 13.698 15.1115L17.9402 10.8683C19.2679 9.54061 19.2678 7.38851 17.9402 6.06073C16.6124 4.73295 14.4593 4.73295 13.1316 6.06073L5.35422 13.8381C4.41696 14.7753 4.41696 16.2953 5.35422 17.2326C6.29146 18.1696 7.81058 18.1697 8.74777 17.2326L16.5261 9.45429C17.0727 8.90759 17.0727 8.02153 16.5261 7.47479C15.9794 6.92807 15.0933 6.9281 14.5466 7.47479L10.3034 11.717C10.0691 11.9513 9.68912 11.9513 9.45481 11.717C9.2207 11.4826 9.22056 11.1026 9.45481 10.8683L13.698 6.62616C14.7133 5.61083 16.3594 5.61081 17.3747 6.62616C18.3899 7.64152 18.39 9.2876 17.3747 10.3029L14.5525 13.1242C14.5504 13.1264 14.5487 13.1289 14.5466 13.131L9.59641 18.0812C8.19058 19.4869 5.91145 19.4869 4.50559 18.0812C3.0997 16.6754 3.0997 14.3953 4.50559 12.9894L9.45481 8.04022L9.45578 8.03827L12.2839 5.2121Z" fill="currentColor"/>
    </svg>
  );
});

AttachmentOutlined.displayName = 'AttachmentOutlined';
