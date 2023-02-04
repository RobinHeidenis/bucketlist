type SkeletonTextProps = React.HTMLAttributes<HTMLDivElement>;

export const SkeletonText: React.FC<SkeletonTextProps> = ({ className = '', ...props }) => {
  return <div className={`animate-pulse rounded-md bg-slate-700 ${className}`} {...props} />;
};