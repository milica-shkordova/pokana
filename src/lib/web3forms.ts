// Web3Forms access keys are read from env vars (see .env.example) instead of
// being committed to source. Keys must be NEXT_PUBLIC_-prefixed because the
// submission happens client-side.

export function slugToEnvName(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

export function getClientWeb3FormsKey(slug: string): string {
  const envName = `NEXT_PUBLIC_WEB3FORMS_KEY_${slugToEnvName(slug)}`;
  const key = process.env[envName];
  if (!key) {
    throw new Error(
      `Missing Web3Forms key for client "${slug}" — set ${envName} in .env.local`,
    );
  }
  return key;
}

export function getInvyContactWeb3FormsKey(): string {
  const key = process.env.NEXT_PUBLIC_INVY_CONTACT_WEB3FORMS_KEY;
  if (!key) {
    throw new Error(
      "Missing Invy contact form Web3Forms key — set NEXT_PUBLIC_INVY_CONTACT_WEB3FORMS_KEY in .env.local",
    );
  }
  return key;
}

export async function submitWeb3Form(payload: {
  access_key: string;
  from_name: string;
  subject: string;
  message: string;
}) {
  return fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
