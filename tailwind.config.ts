import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './main.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
