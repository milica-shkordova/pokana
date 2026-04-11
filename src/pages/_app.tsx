import type { AppProps } from "next/app";
import Head from "next/head";
import "@theme/index.scss";
import config from "@/config";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{config.title}</title>
        <link rel="icon" href={config.favicon} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
