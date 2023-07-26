import { type AppType } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';

import { api } from '~/utils/api';

import '~/styles/globals.css';
import NiceModal from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';
import { dark } from '@clerk/themes';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      {...pageProps}
    >
      <Toaster position="bottom-right" toastOptions={{ duration: 10000 }} />
      <NiceModal.Provider>
        <Component {...pageProps} />
      </NiceModal.Provider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
