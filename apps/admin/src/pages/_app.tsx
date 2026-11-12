import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastProvider } from "@pokanito/ui";
import { SessionProvider } from "@/lib/session";
import "@pokanito/ui/styles.scss";
import "@/styles/admin.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Pokanito Admin</title>
        <link rel="icon" href={`${BASE}/favicon.ico`} sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href={`${BASE}/favicon.svg`} />
        <link rel="icon" type="image/png" href={`${BASE}/favicon-192.png`} />
        <link rel="apple-touch-icon" href={`${BASE}/apple-touch-icon.png`} />
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
