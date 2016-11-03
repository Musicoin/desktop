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
    chainInit: false
  },
  chain: {
    name: "Geth Testnet",
    relativePath: true,
    path: "/bin/geth/",
    command: 'geth --rpc --rpcapi="db,eth,net,web3,personal" --rpcport "8545" --rpcaddr "127.0.0.1" --rpccorsdomain "localhost" --testnet',
    loggerAddress: "0x525eA72A00f435765CC8af6303Ff0dB4cBaD4E44",
    rpcServer: 'http://localhost:8545'
  },
  fileSharing: {
    relativePath: true,
    path: "/bin/go-ipfs/",
    command: "ipfs daemon"
  },
  musicoinService: {
    host: "http://testnet.catalog.musicoin.org"
  }
}
