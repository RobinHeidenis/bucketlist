import { Navbar } from '../nav/Navbar';
import { SkeletonText } from '../loading/SkeletonText';
import { SkeletonListItem } from '../loading/SkeletonListItem';

export const ListSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
    <Navbar />
    <main className="mt-10 flex flex-col items-center justify-center">
      <div className="prose w-1/2">
        <SkeletonText className="h-9 w-32" />
        <SkeletonText className="mt-3 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <SkeletonText className="mt-1 h-3 w-full" />
        <div className="mt-6 flex w-full flex-row items-center justify-start">
          List by <SkeletonText className="mr-2 ml-2 h-3 w-32" /> •{' '}
          <SkeletonText className="mr-2 ml-2 h-3 w-8" /> to-do&apos;s
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
