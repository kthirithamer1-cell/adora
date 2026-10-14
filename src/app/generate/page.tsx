import { redirect } from 'next/navigation';

export default async function GeneratePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.set(key, value);
    }
  }

  const qs = query.toString();
  redirect(qs ? `/studio?${qs}` : '/studio');
}
