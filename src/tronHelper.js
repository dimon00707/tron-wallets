require('dotenv').config();
const TronWeb = require('tronweb');
const { TRON_NETWORK, USDT_CONTRACT_ADDRESS } = require('./config');

const tronWeb = new TronWeb(
  TRON_NETWORK,
  TRON_NETWORK,
  TRON_NETWORK
);

tronWeb.setAddress(process.env.WALLETADRESS);

async function getUsdtBalance(address) {
  const usdtContract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
  const balance = await usdtContract.balanceOf(address).call();
  return tronWeb.fromSun(balance);
}

async function getAccountInfo(address) {
  const account = await tronWeb.trx.getAccount(address);
  return account;
}

module.exports = {
  tronWeb,
  getUsdtBalance,
  getAccountInfo,
  USDT_CONTRACT_ADDRESS,
};