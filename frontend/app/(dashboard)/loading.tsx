import React from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

export default function Loading(): React.ReactElement {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <DashboardIcons
        iconName="Spinner"
        color="#888"
        className="w-9 h-9 animate-spin"
      />
      <p className="text-xl font-semibold text-gray-500">Wird geladen...</p>
    </div>
  );
}
