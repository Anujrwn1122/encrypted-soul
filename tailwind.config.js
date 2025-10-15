/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        zama: {
          yellow: '#FFD54F',
          deep: '#0b0b0f'
        }
      },
      boxShadow: {
        glow: '0 0 50px rgba(255, 213, 79, 0.25)'
      }
    }
  },
  plugins: []
}
