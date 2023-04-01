import type { FC, HTMLAttributes } from 'react';

type SkeletonTextProps = HTMLAttributes<HTMLDivElement>;

export const SkeletonText: FC<SkeletonTextProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-700 ${className}`}
      {...props}
    />
  );
};
