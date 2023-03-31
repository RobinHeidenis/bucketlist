import { Navbar } from '../nav/Navbar';
import { SkeletonListCard } from '../loading/SkeletonListCard';

export const ListIndexSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
    <Navbar />
    <main className="mt-10 flex flex-col items-center justify-center">
      <h1 className="text-4xl">Lists</h1>
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <SkeletonListCard />
        <SkeletonListCard />
        <SkeletonListCard />
        <SkeletonListCard />
        <SkeletonListCard />
      </div>
    </main>
  </div>
);
