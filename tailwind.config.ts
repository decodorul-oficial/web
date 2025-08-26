import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B132B',
          accent: '#1C2541',
          highlight: '#3A506B',
          info: '#5BC0BE',
          soft: '#A1C6EA'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('flowbite/plugin')
  ]
} satisfies Config;


