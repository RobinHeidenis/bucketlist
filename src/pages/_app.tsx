import type { AppType } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import NiceModal from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';
import { dark } from '@clerk/themes';
import { SentryUserManager } from '~/components/SentryUserManager';
import { SpeedInsights } from '@vercel/speed-insights/next';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      dynamic
      {...pageProps}
    >
      <Toaster position="bottom-right" toastOptions={{ duration: 10000 }} />
      <NiceModal.Provider>
        <Component {...pageProps} />
      </NiceModal.Provider>
      <SentryUserManager />
      <SpeedInsights />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
