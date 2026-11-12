import type { Copy, Lang } from "@/content/landing";

export interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** The landing copy in the current language. */
  t: Copy;
  /** True once the saved language has been restored (client only). */
  ready: boolean;
}
