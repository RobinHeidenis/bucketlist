import { type PropsWithChildren } from 'react';

export const FlexRowCenter = ({
  sx,
  children,
}: PropsWithChildren<{ sx?: string }>) => {
  return (
    <div className={`flex flex-row items-center ${sx ?? ''}`}>{children}</div>
  );
};
