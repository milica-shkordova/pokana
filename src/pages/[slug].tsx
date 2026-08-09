import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { getAllSlugs, getClientBySlug } from "@/clients";
import { ClientEntry } from "@/clients/types";
import { templates } from "@/templates";

interface Props {
  client: ClientEntry;
}

export default function ClientPage({ client }: Props) {
  const Template = templates[client.templateId];

  return (
    <>
      <Head>
        <title>{client.config.title}</title>
        <link rel="icon" href={client.config.favicon} />
      </Head>
      <Template config={client.config} clientSlug={client.slug} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getAllSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const client = getClientBySlug(slug);

  if (!client) {
    return { notFound: true };
  }

  return { props: { client } };
};
