import { Html, Head, Main, NextScript } from "next/document";
import { FontLinks } from "@pokanito/ui";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <FontLinks />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
