import type { PropsWithChildren } from 'react';
import { Navbar } from '../nav/Navbar';

export const StandardPage = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
    <Navbar />
    <main className="mt-10 flex flex-col items-center justify-center pb-5">
      {children}
    </main>
  </div>
);
