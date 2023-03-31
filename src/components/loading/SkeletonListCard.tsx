import { ListCardWrapper } from '../lists/ListCardWrapper';
import { SkeletonText } from './SkeletonText';

export const SkeletonListCard = () => (
  <ListCardWrapper>
    <div className="flex h-full flex-col justify-between">
      <div>
        <SkeletonText className="h-6 w-32" />
        <SkeletonText className="mt-3 h-3 w-full" />
        <SkeletonText className="mt-2 h-3 w-full" />
        <SkeletonText className="mt-2 h-3 w-full" />
      </div>
      <div className="card-actions">
        <SkeletonText className="h-3 w-32" />
      </div>
    </div>
  </ListCardWrapper>
);
