import { useRef } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { DEFAULT_PUBLIC_SETTINGS, LANDING_OG_SLUG, ogImageUrl, type PublicSettings, type TemplateSummary } from "@pokanito/shared";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import WhatWeDo from "@/components/landing/WhatWeDo";
import Templates from "@/components/landing/Templates";
import Inside from "@/components/landing/Inside";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import Cursor from "@/components/landing/Cursor";
import { useLandingReveal } from "@/components/landing/useLandingReveal";
import { useSmoothAnchors } from "@/components/landing/useSmoothAnchors";
import { usePauseOffscreen } from "@/components/landing/usePauseOffscreen";
import { serverPublicApi, SITE_URL } from "@/lib/api";
import { LangProvider, useLang } from "@/components/landing/i18n";
import { fmt } from "@/content/landing";

interface Props {
  templates: TemplateSummary[];
  settings: PublicSettings;
}

export default function Landing(props: Props) {
  return (
    <LangProvider>
      <LandingPage {...props} />
    </LangProvider>
  );
}

function LandingPage({ templates, settings }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useLandingReveal(root);
  useSmoothAnchors();
  usePauseOffscreen(root);
  const { t } = useLang();
  const title = fmt(t.meta.title, { name: settings.businessName });

  return (
    <div className="lp ui-root" ref={root}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t.hero.lede} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t.hero.lede} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={ogImageUrl(SITE_URL, LANDING_OG_SLUG)} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={SITE_URL} />
      </Head>
      {/* The header lives inside the hero's pinned intro frame: the envelope
          intro flies the card logo into it and fades its nav in (B1). The
          hero section is a labelled region, so it stays a landmark. */}
      <Hero
        header={<Header businessName={settings.businessName} logoUrl={settings.logoUrl} />}
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
      />
      <main>
        <WhatWeDo />
        <HowItWorks />
        <Templates templates={templates} />
        <Inside />
        <Pricing />
        <Faq />
        <Contact templates={templates} contactEmail={settings.contactEmail} />
      </main>
      <Footer businessName={settings.businessName} instagram={settings.instagram} logoUrl={settings.logoUrl} />
      <Cursor />
    </div>
  );
}

// The template grid comes from the API (Admin › Templates status). The page is
// static and rebuilt on change via on-demand revalidation; if the API is
// unreachable we render without templates and retry soon.
export const getStaticProps: GetStaticProps<Props> = async () => {
  const [templates, settings] = await Promise.allSettled([
    serverPublicApi.templates(),
    serverPublicApi.settings(),
  ]);
  const ok = templates.status === "fulfilled" && settings.status === "fulfilled";
  if (!ok) console.warn("[landing] API unavailable — rendering fallback content");
  return {
    props: {
      templates: templates.status === "fulfilled" ? templates.value : [],
      settings: settings.status === "fulfilled" ? settings.value : DEFAULT_PUBLIC_SETTINGS,
    },
    revalidate: ok ? 600 : 30,
  };
};
