import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '~/utils/api';

import '~/styles/globals.css';
import NiceModal from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster position="bottom-right" />
      <NiceModal.Provider>
        <Component {...pageProps} />
      </NiceModal.Provider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
