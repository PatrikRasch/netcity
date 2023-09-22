/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Roxborough: 'Roxborough',
        Hertical: 'Hertical',
        ArialBlack: 'Arial-Black',
        Geneva: 'Geneva',
        Helvetica: 'Helvetica',
      },
      colors: {
        purpleMain: '#8186dc',
        purpleSoft: '#e2e5f8',
        redMain: '#e83640',
        redSoft: '#f9e5e4',
        grayMain: '#6a6b6b',
        grayMedium: '#bbbbba',
        graySoft: '#e6e6e7',
        graySoftest: '#efeeef',

        textMain: '#373736',
        textMedium: '#858485',
        textSoft: '#949495',

        grayLineThick: '#dcdddc',
        grayLineThin: '#f5f5f5',
      },
      fontSize: {
        verySmall: '11px',
        smaller: '12px',
        small: '13px',
        medium: '15px',
        large: '20px',
      },
    },
  },
  plugins: [],
}
