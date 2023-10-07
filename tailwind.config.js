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
        purpleMain: '#6E77D1',
        purpleSoft: '#e2e5f8',
        redMain: '#e83640',
        redSoft: '#f9e5e4',
        grayMain: '#4b4b4b',
        grayMediumPlus: '#7d7d7d',
        grayMedium: '#bbbbba',
        graySoft: '#e6e6e7',
        graySoftest: '#efeeef',

        textMain: '#373736',
        textMedium: '#858485',
        textSoft: '#949495',

        grayLineThin: '#D9D9D9',
      },
      fontSize: {
        verySmall: '11px',
        smaller: '12px',
        small: '13px',
        medium: '15px',
        large: '20px',
      },
      keyframes: {
        'slide-in-and-out1': {
          '0%, 15%': { transform: 'translateY(24px)', opacity: '100%' },
          '15%, 25%': { transform: 'translateY(0px)' },
          '40%, 100%': { transform: 'translateY(-24px)' },
        },
      },
      animation: {
        'slide-in-and-out1': 'slide-in-and-out1 8s ease-in-out infinite',
        'slide-in-and-out2': 'slide-in-and-out1 8s ease-in-out 2s infinite',
        'slide-in-and-out3': 'slide-in-and-out1 8s ease-in-out 4s infinite',
        'slide-in-and-out4': 'slide-in-and-out1 8s ease-in-out 6s infinite',
      },
    },
  },

  plugins: [],
}
