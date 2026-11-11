import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastProvider } from "@momentelo/ui";
import { SessionProvider } from "@/lib/session";
import "@momentelo/ui/styles.scss";
import "@/styles/admin.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Momentelo Admin</title>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" href="/favicon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ToastProvider>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </ToastProvider>
    </>
  );
}
