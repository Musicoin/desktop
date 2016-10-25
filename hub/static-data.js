module.exports = {
  guestUser:{
    entry:{login:'Guest', fullName:'Guest User', pwdHash:null, appAccount:null, autoLoginExpire:0, autoLogin:true, external:{image: 'internal/guestFace.svg',}},
    list:{user:'Guest',image: 'internal/guestFace.svg', autoLogin:true},
  },
  chain: {
    syncTmpl: {start:0,current:0,max:0,syncProgress:0},
  },
  dummyTestData: {
    user_japple:{login:'japple', fullName:'Johnny Appleseed', autoLoginExpire:0, autoLogin:true, dataFile: '12fff32aa631213.udm',  pwdHash:'b0a6ea25250a05d7134d512eb81e9d248e9823eb616b3809bc2aafd8669595fe', nonce: 'abc123xyz890', appAccount:'jjss22jj11', mainAccount:'zzjjss22jj11', accounts:['zzjjss22jj11'], keys:{}, external:{image: 'users/avatars/japple.png',}},

    user_AkiroKurosawa:{login:'AkiraKurosawa', fullName:'Akira Kurosawa', autoLoginExpire:0, autoLogin:false, dataFile: '12fff32aa631213.udm',  pwdHash:'b0a6ea25250a05d7134d512eb81e9d248e9823eb616b3809bc2aafd8669595fe', nonce: 'abc123xyz890', appAccount:'jjss22jj11', mainAccount:'zzjjss22jj11', accounts:['zzjjss22jj11'], keys:{}, external:{image: 'users/avatars/AkiraKurosawa.png',}},

    user_JimBim:{login:'JimBim', fullName:'Jim Bim Bam', autoLoginExpire:0, autoLogin:false, dataFile: '12fff32aa631213.udm',  pwdHash:'b0a6ea25250a05d7134d512eb81e9d248e9823eb616b3809bc2aafd8669595fe', nonce: 'abc123xyz890', appAccount:'jjss22jj11', mainAccount:'zzjjss22jj11', accounts:['zzjjss22jj11'], keys:{}, external:{image: 'users/avatars/JimBim.png',}},
  },
  playback: {
    playbackPaymentPercentage: 70
  },
  musicoinHost: "http://catalog.musicoin.org"
}
