import { ReactElement } from 'react';

export const EASYSPEACH_PATH =
  'M202.24 177c-36.13-17.25-66.63-25.7-134.24-26a31.3 31.3 0 0 0-17.92 5.33A31.995 31.995 0 0 0 36 182.9V376c0 19.34 13.76 33.93 32 33.93 71.07 0 122.36-3.36 165.06 37 1.65 1.56 4.25 1.5 5.81-.15.73-.77 1.13-1.79 1.13-2.85V209.82c0-4.6-1.99-8.98-5.46-12a143.303 143.303 0 0 0-32.3-20.82Zm259.68-20.7c-5.3-3.55-11.55-5.4-17.92-5.3-67.61.3-98.11 8.71-134.24 26a143.428 143.428 0 0 0-32.31 20.78c-3.46 3.03-5.45 7.4-5.45 12v234.13a3.93 3.93 0 0 0 3.93 3.93c1.03 0 2.02-.4 2.75-1.12 25.67-25.5 50.72-36.82 165.36-36.81 17.67 0 32-14.33 32-32v-195a32.003 32.003 0 0 0-14.12-26.61Z';

type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function EasySpeech(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = '24' } = props;
  return (
    <svg
      width="24"
      height={height}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={EASYSPEACH_PATH} fill={fontColor} />
      <circle cx="256" cy="107" r="67" fill={fontColor} />
    </svg>
  );
}
