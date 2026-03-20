import type { AppProps } from "next/app";
import "@root/src/index.scss";
import "@root/pages/home/HomePage.scss";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
