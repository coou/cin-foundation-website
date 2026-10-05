/** @type {import('tailwindcss').Config} */
// Matches the configuration the page used when it loaded Tailwind from a CDN at run time,
// so the compiled stylesheet renders the page as before. See task 21 in the CIN documents.
export default {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1e3a8a',
        'secondary-blue': '#3b82f6',
        'accent-emerald': '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
