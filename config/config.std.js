

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
      '--rpcapi=admin,db,eth,net,web3,personal',
      '--rpcport', '8585',
      '--rpcaddr', '127.0.0.1',
      '--rpccorsdomain', 'localhost',
      '--fast',
      '--port', '30333',
      '--cache=512',
      '--ethstats={rndNodeID}:musicstatsbypirl@stats.musicoin.org'],
    rpcServer: 'http://localhost:8585'
  }
}
