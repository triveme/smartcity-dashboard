import { ReactElement } from 'react';
import Link from 'next/link';

export default function FullSizedLink({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}): ReactElement {
  return (
    <Link href={url} className="w-full h-full flex justify-center items-center">
      {children}
    </Link>
  );
}
