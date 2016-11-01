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
    geth: {
      start: true,
      path: "/bin/geth/"
    },
    ipfs: {
      start: true,
      path: "/bin/go-ipfs/"
    }
  }
}
