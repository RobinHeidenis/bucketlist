import { SkeletonText } from './SkeletonText';

export const SkeletonListItem = () => (
  <>
    <div className="mb-3 flex flex-row justify-between">
      <div className="flex w-full flex-row">
        <SkeletonText className="h-7 w-7" />
        <div className="ml-2 flex w-full flex-col">
          <SkeletonText className="m-0 h-6 w-32" />
          <SkeletonText className="m-0 mt-2 h-3 w-full" />
          <SkeletonText className="m-0 mt-1 h-3 w-full" />
        </div>
      </div>
    </div>
    <div className="divider" />
  </>
);
