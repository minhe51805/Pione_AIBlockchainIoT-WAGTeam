require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
// Load .env from current directory
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ZEROSCAN_API_KEY = process.env.ZEROSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    pionezero: {
      url: "https://rpc.zeroscan.org",
      chainId: 5080,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  sourcify: {
    enabled: true
  },
  etherscan: {
    apiKey: {
      pioneZero: ZEROSCAN_API_KEY,
    },
    customChains: [
      {
        network: "pioneZero",
        chainId: 5080,
        urls: {
          apiURL: "https://zeroscan.org/api/",
          browserURL: "https://zeroscan.org/"
        }
      }
    ]
  }
};
