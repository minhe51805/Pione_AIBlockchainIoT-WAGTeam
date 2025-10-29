require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true  // Enable via-IR để xử lý "stack too deep"
    }
  },
  networks: {
    pzo: {
      url: "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
