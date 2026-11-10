import Head from "next/head";
import { ButtonLink, Eyebrow, Heading, Lede, Wordmark } from "@momentelo/ui";

export default function NotFoundPage() {
  return (
    <main className="state-page ui-root">
      <Head>
        <title>Not found · Momentelo</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="state-page__card">
        <Wordmark />
        <Eyebrow>404</Eyebrow>
        <Heading level={1} size="md">
          This invitation can&apos;t be found
        </Heading>
        <Lede>The link may be mistyped, or the invitation is no longer online.</Lede>
        <ButtonLink href="/">Go to Momentelo</ButtonLink>
      </div>
    </main>
  );
}
