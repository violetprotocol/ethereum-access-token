const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov", "text"],
  configureYulOptimizer: true,
  providerOptions: {
    mnemonic: process.env.MNEMONIC,
  },
  skipFiles: ["test"],
};
