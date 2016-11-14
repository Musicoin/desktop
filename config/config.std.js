module.exports = {
  etherServerRpc:'http://localhost:8545',
  ui:{
    hibryda: false,
    dan: true,
    other: false,
  },
  lightwallet: false,
  rpcComm: false,
  startup: {
    chain: true,
    fileSharing: true,
    chainInit: true
  },
  chain: {
    name: "Musicoin",
    path: "{process.cwd}/bin/geth/",
    command: './geth',
    args: ['--identity', 'Musicoin',
      '--networkid', '55313716',
      '--datadir', '{appdata}/chain',
      '--rpc',
      '--rpcapi=db,eth,net,web3,personal,miner',
      '--rpcport', '8545',
      '--rpcaddr', '127.0.0.1',
      '--rpccorsdomain', 'localhost'],
    loggerAddress: "0x1BA9842b9f4886837edff6D2286342c47Ad8085A",
    rpcServer: 'http://localhost:8545',
    txDirectory: '{appdata}/tx/'
  },
  fileSharing: {
    name: "ipfs",
    path: "{process.cwd}/bin/go-ipfs/",
    args: ['daemon', '--init=true'],
    command: "./ipfs",
    prereq: {
      comment: "Workaround: Forces deletion of the ipfs lock file. This will do nothing if the lock file is in use (i.e. if ipfs is already running)",
      name: "ipfs-cleanup",
      path: "{process.cwd}/bin/go-ipfs/",
      args: ['repo', 'fsck'],
      command: "./ipfs",
      sync: true
    }
  },
  chainInit: {
    chainDir: "{appdata}/chain"
  },
  musicoinService: {
    host: "http://catalog.musicoin.org"
  },
  local: {
    cacheDir: "{appdata}/cache"
  }
}
