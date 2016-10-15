var mscbuffer = {
  Web3:require('web3'),
  BigNumber:require('bignumber.js'),
  player:null,
  pendingPaymentAction:null,
  musicoin:null,
  pppAbi: require('./abis.js').pppAbi,
  loggerAbi: require('./abis.js').loggerAbi,
}
mscbuffer.web3 = new mscbuffer.Web3();
//mscbuffer.blockchain = new mscbuffer.Web3Connector();
//mscbuffer.musicoinService = new mscbuffer.MusicoinConnector(mscbuffer.web3);
mscbuffer.pendingPayments = new mscbuffer.BigNumber(0);
module.exports = mscbuffer;//
