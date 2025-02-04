import { redirect } from 'next/navigation';

type Props = {
  params: {
    tenant?: string;
  };
};

export default async function Home({ params }: Props): Promise<JSX.Element> {
  const tenant = params.tenant;
  const adminUrl = tenant ? `/${tenant}/admin/widgets` : '/admin/widgets';
  redirect(adminUrl);
}
