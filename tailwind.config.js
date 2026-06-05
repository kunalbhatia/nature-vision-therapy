module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pinkCustom: '#ff63c7',
        anaglyphRed: '#dc2626',
        anaglyphCyan: '#0891b2',
      },
    },
  },
  plugins: [require('daisyui')],
};
