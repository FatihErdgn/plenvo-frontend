module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('/src/assets/images/background-pattern.png')", // Eğer src'de saklıysa
        // 'login-bg': "url('/images/login-background.png')", // Eğer public klasöründe saklıysa
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
