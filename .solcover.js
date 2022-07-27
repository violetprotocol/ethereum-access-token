const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov", "text", "clover"],
  configureYulOptimizer: true,
  providerOptions: {
    mnemonic: process.env.MNEMONIC,
  },
  skipFiles: ["test"],
};
