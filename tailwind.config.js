/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          cosmos: '#4C061D',
          ochre: {
            DEFAULT: '#D17A22',
            100: '#F6E7D8',
            200: '#F0D8BE',
            300: '#E9C6A0',
            400: '#E0AD78',
            500: '#D17A22',
            600: '#B8661C',
            700: '#8E4E16',
            800: '#6A3C11',
            900: '#4B2B0C',
          },
          sage: '#B4C292',
          reseda: '#736F4E',
          drab: '#3B3923',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAF7F3',
          dark: '#171513',
        },
        text: {
          DEFAULT: '#2B2B2B',
          inverted: '#F4F2F0',
          muted: '#6B6B6B',
        },
        success: '#2E7D32',
        warning: '#B26A00',
        error: '#C62828',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(0,0,0,0.08)',
        softer: '0 10px 30px rgba(0,0,0,0.10)',
        ring: '0 0 0 3px rgba(209, 122, 34, 0.25)',
      },
      transitionDuration: {
        fast: '180ms',
        normal: '220ms',
        slow: '260ms',
      },
      scale: {
        pressed: '0.98',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus-visible']);
    }
  ],
}

