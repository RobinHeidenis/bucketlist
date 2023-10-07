import type { AppType } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { api } from '~/utils/api';
import NiceModal from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';
import { dark } from '@clerk/themes';
import { SentryUserManager } from '~/components/SentryUserManager';

import '~/styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme={'dark'}>
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
        <SentryUserManager />
      </ClerkProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);
