module.exports = {
  startup: {
    chain: true,
  },
  chain: {
    name: "Musicoin Wallet",
    path: "{process.cwd}/bin/gmc/",
    command: './gmc',
    args: [
      '--rpc',
      '--rpcapi=admin,db,eth,net,web3,personal,miner',
      '--rpcport', '8545',
      '--rpcaddr', '127.0.0.1',
      '--rpccorsdomain', 'localhost',
      '--fast',
      '--cache=2048'],
    rpcServer: 'http://localhost:8545'
  }
}
