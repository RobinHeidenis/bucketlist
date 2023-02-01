import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => (
  <Html lang="en" className="h-full" data-theme="night">
    <Head />
    <body className="h-full">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
