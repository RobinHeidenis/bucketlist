import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript } from '@mantine/core';

const Document = () => (
  <Html lang="en" className="h-full" data-theme="night">
    <Head>
      <ColorSchemeScript defaultColorScheme={'dark'} />
    </Head>
    <body className="h-full">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
