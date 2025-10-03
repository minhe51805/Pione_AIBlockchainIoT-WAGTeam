require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    pzo: {
      url: "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
