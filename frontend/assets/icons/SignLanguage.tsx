import { ReactElement } from 'react';

export const SIGNLANGUAGE_PATH =
  'M455-40 110-71q-17-2-28-14.5T73-115q2-17 14.5-27.5T117-151l169 15 19-68-233-44q-17-3-26-16.5T40-294q3-17 16.5-26t30.5-6l239 45 17-59-270-73q-16-5-24-19t-3-30q5-17 18.5-25t29.5-3l270 73 15-53-189-98q-15-8-20-24t3-30q8-15 24-20t30 3l234 122 3-70q1-18 9-32t21-23q13-10 28.5-13.5T555-654l17 7 98 227q8 19 9 39t-4 40l-51 185q-16 56-63.5 89T455-40Zm280-294q5-23 4-47t-9-47l-97-225 23-14-81-197q-6-15 0-30.5t21-21.5q16-7 31-.5t22 21.5l101 244 46-52q11-12 26-18t32-5q17 2 31 9.5t24 21.5l11 16-72 237q-6 20-18 36.5T801-378l-66 44ZM470-699l-84-122q-10-14-7-30t17-25q14-10 30-7t26 17l104 151q-22-5-44 0t-42 16Zm-63 86-108-56-21-25q-11-13-9.5-29.5T284-751q13-11 29-9t27 15l80 97q-5 8-8 17t-5 18Z';

type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function SignLanguage(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = '24' } = props;
  return (
    <svg
      width="24"
      height={height}
      viewBox="0 -960 960 960"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={SIGNLANGUAGE_PATH} fill={fontColor} />
    </svg>
  );
}
