export function getColumnSpanSettings(width: number): string {
  switch (width) {
    case 4:
      return 'col-span-12 sm:col-span-12 lg:col-span-4';
    case 6:
      return 'col-span-12 sm:col-span-12 lg:col-span-6';
    case 8:
      return 'col-span-12 sm:col-span-12 lg:col-span-8';
    case 12:
      return 'col-span-12 sm:col-span-12 lg:col-span-12';
    default:
      return 'col-span-12 sm:col-span-12 lg:col-span-12';
  }
}
