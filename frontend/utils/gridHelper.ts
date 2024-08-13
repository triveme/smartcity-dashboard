export function getColumnSpanSettings(width: number): string {
  switch (width) {
    case 8:
      return 'col-span-4 sm:col-span-4 md:col-span-4 lg:col-span-6 xl:col-span-8';
    case 12:
      return 'col-span-4 sm:col-span-4 md:col-span-4 lg:col-span-8 xl:col-span-12';
    default:
      return 'col-span-4 sm:col-span-4 md:col-span-4 lg:col-span-4 xl:col-span-4';
  }
}
