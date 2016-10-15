module.exports = {
  verbose: true,
  plugins: {
    local: {
      browsers: ['chrome', 'firefox']
    },
    sauce: {
      disabled: true,
      browsers: ['chrome', 'firefox']
    }
  }
};
