import { ReactElement } from 'react';

export default function TableWrapper({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <div className="h-full relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right">
        {children}
      </table>
    </div>
  );
}
