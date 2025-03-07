import { redirect } from 'next/navigation';
import { JSX } from 'react';

type Props = {
  params: Promise<{
    tenant?: string;
  }>;
};

export default async function Home(props: Props): Promise<JSX.Element> {
  const params = await props.params;
  const tenant = params.tenant;
  const adminUrl = tenant ? `/${tenant}/admin/widgets` : '/admin/widgets';
  redirect(adminUrl);
}
