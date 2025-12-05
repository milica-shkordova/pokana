import type { AppProps } from "next/app";
import { useEffect } from "react";
import config from "@root/config.json";
import "@root/src/index.scss";
import "@root/src/components/Button/Button.scss";
import "@root/pages/login/LoginPage.scss";
import "@root/pages/home/HomePage.scss";
import "@root/src/styles/pages/ErrorPage.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    config.theme.forEach((theme) => {
      const color_name: string = Object.keys(theme)[0];
      const color_value = (theme as any)[color_name];

      document.documentElement.style.setProperty(
        `--color-${color_name}`,
        color_value
      );
    });
  }, []);

  return <Component {...pageProps} />;
}
