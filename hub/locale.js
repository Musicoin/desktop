var locale = {
  en:{
    navMenu:{
      headers:{
        categories:'Categories',
        playlist:'Playlist',
        musician:'Musician',
        developer:'Developer',
        account:'Account'
      },
      items:{
        newReleases:'New Releases',
        coinboard:'Coinboard',
        myFavorites:'My Favorites',
        myPlaylists:'My Playlists',
        collection:'Collection',
        myWorks:'My Works',
        myProfile:'My Profile',
        editor:'Editor',
        utilities:'Utilities',
        wallet:'Wallet',
        settings:'Settings',
        following:'Following',
        history:'History'
      }
    },
    layeredMenu:[
      {user:true, header:{name:'user',shortcut:'usr',icon:''},items:[
        {name:'Settings',shortcut:'set'},
        {name:'Create account |temp|',shortcut:'acc'},
        {name:'Log out',shortcut:'loo'},
      ]},
      {dynamic:true, header:{name:'Categories',shortcut:'cat',icon:'catalogicon'},items:[
        {name:'New releases',shortcut:'rel'},
        {name:'Coinboard',shortcut:'cbr'},
      ]},
      {header:{name:'Playlist',shortcut:'pls',icon:'playlisticon'},items:[
        {name:'My favorites',shortcut:'myf'},
        {name:'My playlists',shortcut:'mpl'},
      ]},
      {header:{name:'Musician',shortcut:'mus',icon:'musicianicon'},items:[
        {name:'My works',shortcut:'myw'},
      ]},
      {header:{name:'Developer',shortcut:'dev',icon:'developericon'},items:[
        {name:'Utilities',shortcut:'uti'},
      ]},
    ],
    paymentApprovalDialog: {
      confirmDisposition:'Confirm payment of ♮',
      confirmationMessage:'bla, bla',
      acceptPayment:'Accept',
      declinePayment:'Decline',
    },
    playView: {
      playAll:'playAll',
      addContract:'Add',
      pausePlay:'Pause',
      status:'status:',
    },
    worksView: {
      headers: {
        assets: 'Assets',
        licensing: 'Licensing',
        contributorShares: 'Contributor Shares',
        developerTools: 'Developer Tools',
      },
      buttons: {
        upload: 'Upload',
        release: 'Release',
      },
    },
    historyView: {
      label: {
        recentTransactions: "Recent Transactions"
      }
    },
    walletView: {
      label: {
        history: "History",
        balance: "Balance",
        send: "Send",
        to: "to"
      },
      instructions: {
        enterAddress: "enter an address"
      }
    },
    workEditor: {
      instructions: {
        selectImage: "click to select an image",
        addNewLicense: "Click the "+" symbol to add a new license."
      },
      workTypes: {
        score: "Score",
        lyrics: "Lyrics",
        recording: "Recording"
      },
      fields: {
        title: "Title",
        artist: "Artist",
        workType: "Work Type",
        licenses: "Licenses"
      },
      validation: {
        artist: "You must enter the artist's name",
        title: "You must enter a title",
        image: "You must select an image",
      },
      actions: {
        releaseWork: "Release Work",
        showAdvanced: "Show advanced options",
        hideAdvanced: "Hide advanced options",
      }
    },
    editorView: {
      headers: {
        contributors: 'Contributors',
        royalties: 'Royalties',
      },
      labels: {
        price: 'price (in ether)',
        addContributor: 'add contributor',
        addRoyalty: 'add royalty',
      },
      price: 'Price',
      ppp: 'PPP',
      shares: 'shares',
    },
    parityView: {
      defaultAccount: 'My default account is ',
      allAccounts: 'All accounts ',
      myBalanceIs: 'My balance is ',
      mining: 'Mining: ',
      myCoinbaseIs: 'My coinbase is ',
      connected: 'Connected: ',
      syncing: 'syncing: ',
      status: 'Status: ',
      balance: 'Balance: ',
      tx:'tx: ',
      receipt:'receipt: ',
      buttons: {
        refreshStatus: 'Connected: ',
        clear: 'Clear',
        checkBalance: 'check balance',
        createAccount: 'create account',
        showMyMinedBlocks: 'show my mined blocks',
        showBlock: 'show block',
        checkTransaction: 'check transaction',
      },
    },
    playlistsView: {
      instructions: "Click the '+' sign to add a playlist"
    },
    artistView: {
      labels: {
        follow: "follow",
        following: "following",
        tip: "tip",
        tipPending: "...",
        tipFailed: ":(",
        tipSuccess: ":)"
      }
    },
    userProfileView: {
      messages: {
        NewUser:"Register your account on the Musicoin website to enable Musician Mode",
        Confirm:"You're almost there! Confirm your account by sending a small payment to Musicoin.",
        Registered:"Once your account is verified, the music you release will automatically appear in the public catalog",
        Verified:"Your account is verified."
      },
      actions: {
        NewUser:"Register your account",
        Confirm:"Confirm your account",
        Registered:"Learn More",
        Verified:"Get Started!",
        Mining:"Enable mining to earn Musicoins"
      }
    },
    simpleLogin: {
      labels: {
        selectAccount: "Select an account"
      }
    },
    connectionWatch: {
      chainReady:'Connected to MusicChain',
      chainNotReady:'Not connected to MusicChain',
      ipfsReady:'Connected to IPFS',
      ipfsNotReady:'Not connected to IPFS',
      serverReady:'Connected to server',
      serverNotReady:'Not connected to server',
    },
    accountCreateConfirmDialog: {
      header:'Provide a password to secure your account',
      description:'Provide a password in input box and hit Enter when done.',
      password:'password',
      cancel:'cancel',
      success:'Success',
      errorOnInit:'There was an error while trying to call application\'s backend.',
      errorInProcessing:'There was an error during processing your request.\nPlease try again or consult this error on musicoin.org support forum\n\nClick or tap anywhere around to dismiss this message.',

    },
    accountSelector: {
      roles:{
        coinbase: 'Coinbase',
        mainPrivate: 'Main private',
        appBuiltIn: 'Application\'s built in',
      },
      placeholder: 'select existing or create new',
      createNew: 'create new account',
    },
    general: {
      favorites: "My Favorites"
    }
  },
  se:{
    navMenu:{
      headers:{
        categories:'Kategorier',
        playlist:'Spellista',
        musician:'Musiker',
        developer:'Developer',
      },
      items:{
        newReleases:'Ny frisättningen',
        coinboard:'Coinboard',
        myFavorites:'Mina favoriter',
        myPlaylists:'Mina spellistor',
        collection:'Kollektion',
        myWorks:'Mina skapelser',
        editor:'Redigering',
        utilities:'Verktyg',
      }
    },
    layeredMenu:[
      {user:true, header:{name:'user',shortcut:'usr',icon:''},items:[
        {name:'Installningar',shortcut:'set'},
        {name:'Create account |temp|',shortcut:'acc'},
        {name:'Log out',shortcut:'loo'},
      ]},
      {dynamic:true, header:{name:'Kategorier',shortcut:'cat',icon:'catalogicon'},items:[
        {name:'Ny frisättningen',shortcut:'rel'},
        {name:'Coinboard',shortcut:'cbr'},
        {name:'Mina favoriter',shortcut:'myf'},
      ]},
      {header:{name:'Spellista',shortcut:'pls',icon:'playlisticon'},items:[
        {name:'Mina spellistor',shortcut:'mpl'},
        {name:'Kollektion',shortcut:'col'},
      ]},
      {header:{name:'Musiker',shortcut:'mus',icon:'musicianicon'},items:[
        {name:'ina skapelser',shortcut:'myw'},
        {name:'Redigering',shortcut:'edi'},
      ]},
      {header:{name:'Developer',shortcut:'dev',icon:'developericon'},items:[
        {name:'Verktyg',shortcut:'uti'},
      ]},
    ],
    paymentApprovalDialog: {
      confirmDisposition:'Confirm payment of ♮',
      confirmationMessage:'bla, bla',
      acceptPayment:'Accept',
      declinePayment:'Decline',
    },
    playView: {
      playAll:'playAll',
      addContract:'Add',
      pausePlay:'Pause',
      status:'status:',
    },
    worksView: {
      headers: {
        assets: 'Assets',
        licensing: 'Licensing',
        contributorShares: 'Contributor Shares',
        developerTools: 'Developer Tools',
      },
      buttons: {
        upload: 'Upload',
        release: 'Release',
      },
    },
    editorView: {
      headers: {
        contributors: 'Contributors',
        royalties: 'Royalties',
      },
      labels: {
        price: 'price (in ether)',
        addContributor: 'add contributor',
        addRoyalty: 'add royalty',
      },
      price: 'Price',
      ppp: 'PPP',
      shares: 'shares',
    },
    parityView: {
      defaultAccount: 'My default account is ',
      allAccounts: 'All accounts ',
      myBalanceIs: 'My balance is ',
      mining: 'Mining: ',
      myCoinbaseIs: 'My coinbase is ',
      connected: 'Connected: ',
      syncing: 'syncing: ',
      status: 'Status: ',
      balance: 'Balance: ',
      tx:'tx: ',
      receipt:'receipt: ',
      buttons: {
        refreshStatus: 'Connected: ',
        clear: 'Clear',
        checkBalance: 'check balance',
        createAccount: 'create account',
        showMyMinedBlocks: 'show my mined blocks',
        showBlock: 'show block',
        checkTransaction: 'check transaction',
      },
    },
    connectionWatch: {
      chainReady:'Connected to MusicChain',
      chainNotReady:'Not connected to MusicChain',
      ipfsReady:'Connected to IPFS',
      ipfsNotReady:'Not connected to IPFS',
      serverReady:'Connected to server',
      serverNotReady:'Not connected to server',
    },
    accountCreateConfirmDialog: {
      header:'Provide a password to secure your account',
      description:'Provide a password in input box and hit Enter when done.',
      password:'password',
      cancel:'cancel',
      success:'Success',
      errorOnInit:'There was an error while trying to call application\'s backend.',
      errorInProcessing:'There was an error during processing your request.\nPlease try again or consult this error on musicoin.org support forum\n\nClick or tap anywhere around to dismiss this message.',
    },
    accountSelector: {
      roles:{
        coinbase: 'Coinbase',
        mainPrivate: 'Main private',
        appBuiltIn: 'Application\'s built in',
      },
      placeholder: 'select existing or create new',
      createNew: 'create new account',
    }
  }
}

module.exports = locale;//
