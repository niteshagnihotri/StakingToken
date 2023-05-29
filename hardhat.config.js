/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path: './.env.local'});

const { NEXT_PUBLIC_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "polygon",
  networks: {
    hardhat: {},
    polygon: {
      url: NEXT_PUBLIC_RPC_URL,
      accounts: [PRIVATE_KEY]
    },
  },
};
