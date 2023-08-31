import { Navbar } from '../nav/Navbar';
import { SkeletonText } from '../loading/SkeletonText';
import { SkeletonListItem } from '../loading/SkeletonListItem';
import { EyeIcon, ListBulletIcon, UserIcon } from '@heroicons/react/24/outline';

export const ListSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
    <Navbar />
    <main className="mt-10 flex flex-col items-center justify-center">
      <div className="prose w-full max-w-[95%] min-[823px]:max-w-[85%] 2xl:max-w-[50%]">
        <SkeletonText className="h-9 w-32" />
        <SkeletonText className="mt-3 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <div className="mt-6 flex w-full flex-row items-center justify-start">
          <UserIcon className="mr-1 h-5 w-5" /> List by
          <SkeletonText className="ml-2 mr-2 h-3 w-32" /> •
          <ListBulletIcon className="ml-2 mr-1 h-5 w-5" />
          <SkeletonText className="ml-2 mr-2 h-3 w-8" /> items •
          <EyeIcon className="ml-2 mr-1 h-5 w-5" />
          <SkeletonText className="ml-2 mr-2 h-3 w-16" />
        </div>
        <div className="divider" />
        <div className="mt-5">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      </div>
    </main>
  </div>
);
