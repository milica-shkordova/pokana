import type { AppProps } from "next/app";
import Head from "next/head";
// Order matters: design system → invitation templates → this app.
import "@pokanito/ui/styles.scss";
import "@pokanito/templates/styles.scss";
import "@/styles/global.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>Pokanito — Digital invitations that feel like an event</title>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
