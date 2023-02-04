import { ListCardWrapper } from '../lists/ListCardWrapper';
import { SkeletonText } from './SkeletonText';

export const SkeletonListCard = () => (
  <ListCardWrapper>
    <div className="flex flex-col justify-between h-full">
    <div>
      <SkeletonText className="h-6 w-32" />
      <SkeletonText className="h-3 w-full mt-3" />
      <SkeletonText className="h-3 w-full mt-2" />
      <SkeletonText className="h-3 w-full mt-2" />
    </div>
    <div className="card-actions">
      <SkeletonText className="h-3 w-32" />
    </div>
    </div>
  </ListCardWrapper>
);
