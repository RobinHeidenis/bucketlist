import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  // corePlugins: {
  //   preflight: false,
  // },
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      zIndex: {
        '60': '60',
      },
    },
    screens: {
      xsm: '410px',
      ...defaultTheme.screens,
    },
  },
  daisyui: {
    themes: ['night'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
} satisfies Config;

export default config;
