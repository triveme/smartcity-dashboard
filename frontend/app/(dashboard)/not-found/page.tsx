import { ReactElement } from 'react';

export default function NotFound(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl mt-4">Page Not Found</p>
      </div>
    </div>
  );
}
