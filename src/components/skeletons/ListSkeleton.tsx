import { Navbar } from '../nav/Navbar';
import { SkeletonText } from '../loading/SkeletonText';
import { SkeletonListItem } from "../loading/SkeletonListItem";

export const ListSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
    <Navbar />
    <main className="mt-10 flex flex-col items-center justify-center">
      <div className="prose w-1/2">
        <SkeletonText className="h-9 w-32" />
        <SkeletonText className="h-3 w-full mt-3" />
        <SkeletonText className="h-3 w-full mt-1" />
        <SkeletonText className="h-3 w-full mt-1" />
        <SkeletonText className="h-3 w-full mt-1" />
        <div className="flex w-full flex-row items-center justify-start mt-6">
            List by <SkeletonText className="h-3 w-32 mr-2 ml-2" /> •{' '}
            <SkeletonText className="h-3 w-8 mr-2 ml-2" /> to-do&apos;s
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