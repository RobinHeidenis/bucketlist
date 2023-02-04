import { SkeletonText } from './SkeletonText';

export const SkeletonListItem = () => (
  <>
    <div className="mb-3 flex flex-row justify-between">
      <div className="flex flex-row w-full">
        <SkeletonText className="h-7 w-7" />
        <div className="flex flex-col ml-2 w-full">
          <SkeletonText className="m-0 h-6 w-32" />
          <SkeletonText className="m-0 h-3 w-full mt-2" />
          <SkeletonText className="m-0 h-3 w-full mt-1" />
        </div>
      </div>
    </div>
    <div className="divider" />
  </>
);