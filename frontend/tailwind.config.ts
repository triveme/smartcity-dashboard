import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
    'sm:col-span-4',
    'md:col-span-4',
    'lg:col-span-4',
    'xl:col-span-4',
    'col-span-4',
    'col-span-5',
    'col-span-6',
    'lg:col-span-6',
    'col-span-7',
    'col-span-8',
    'lg:col-span-8',
    'xl:col-span-8',
    'col-span-9',
    'col-span-10',
    'col-span-11',
    'col-span-12',
    'xl:col-span-12',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        blue: {
          900: '#1D2330',
          500: '#9EB3E0',
          400: '#3D4760',
          300: '#2b3244',
          200: '#59647D',
          100: '#C7D2EE',
        },
        gray: {
          900: '#000000',
          800: '#1E1E1E',
          200: '#BFBFBF',
          100: '#59647D',
        },
        gold: {
          900: '#F4A310',
        },
        green: {
          500: '#049A1A',
        },
        cyan: {
          200: '#0AD6CD',
        },
        pink: {
          100: '#DE507D',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
export default config;
