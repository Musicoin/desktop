var locale = {
  en:{
    navMenu:{
      headers:{
        categories:'Categorias',
        playlist:'Playlists',
        musician:'Musico',
        developer:'Desarrollador',
        account:'Cuenta'
      },
      items:{
        newReleases:'Nuevos Lanzamientos',
        coinboard:'Tablero de Moneda',
        myFavorites:'Mis Favoritos',
        myPlaylists:'Mis Playlists',
        collection:'Coleccion',
        myWorks:'Mis Trabajos',
        myProfile:'Mi perfil',
        editor:'Editor',
        utilities:'Utilidades',
        wallet:'Billetera',
        settings:'Ajustes',
        following:'Siguiendo',
        history:'Historial'
      }
    },
    layeredMenu:[
      {user:true, header:{name:'user',shortcut:'usr',icon:''},items:[
        {name:'Ajustes',shortcut:'set'},
        {name:'Crear cuenta |temp|',shortcut:'acc'},
        {name:'Salir',shortcut:'loo'},
      ]},
      {dynamic:true, header:{name:'Categorias',shortcut:'cat',icon:'catalogicon'},items:[
        {name:'Nuevos Lanzamientos',shortcut:'rel'},
        {name:'Tablero de Moneda',shortcut:'cbr'},
      ]},
      {header:{name:'Playlist',shortcut:'pls',icon:'playlisticon'},items:[
        {name:'Mis favoritos',shortcut:'myf'},
        {name:'Mis playlists',shortcut:'mpl'},
      ]},
      {header:{name:'Musico',shortcut:'mus',icon:'musicianicon'},items:[
        {name:'Mis Trabajos',shortcut:'myw'},
      ]},
      {header:{name:'Desarrollador',shortcut:'dev',icon:'developericon'},items:[
        {name:'Utilidades',shortcut:'uti'},
      ]},
    ],
    paymentApprovalDialog: {
      confirmDisposition:'Confirmar pago de ♮',
      confirmationMessage:'bla, bla',
      acceptPayment:'Aceptar',
      declinePayment:'Rechazar',
    },
    playView: {
      playAll:'playAll',
      addContract:'Añadir',
      pausePlay:'Pausar',
      status:'status:',
    },
    worksView: {
      headers: {
        myWorks: 'Mis Trabajos',
        assets: 'Activos',
        licensing: 'Licencia',
        contributorShares: 'Acciones de Colaborador',
        developerTools: 'Herramientas de Desarrollador',
      },
      buttons: {
        upload: 'Subir',
        release: 'Liberar',
      },
    },
    historyView: {
      label: {
        recentTransactions: "Transacciones Recientes"
      }
    },
    walletView: {
      label: {
        history: "Historial",
        balance: "Balance",
        send: "Enviar",
        to: "a"
      },
      instructions: {
        enterAddress: "ingrese una direccion"
      }
    },
    workDetailView: {
      label: {
        pending: "Pendiente...",
        plays: "Plays",
        tips: "Tips",
        earned: "Ganado",
        releaseDate: "Publicado el"
      }
    },
    workEditor: {
      instructions: {
        selectImage: "presiona para seleccionar una imagen",
        addNewLicense: "Presiona el simbolo "+" para añadir una nueva licencia."
      },
      workTypes: {
        score: "Partitura",
        lyrics: "Letra",
        recording: "Grabacion"
      },
      fields: {
        title: "Titulo",
        artist: "Artista",
        workType: "Typo de Trabajo",
        licenses: "Licencias"
      },
      validation: {
        artist: "Debes ingresar un nombre de artista",
        title: "Debes ingresar un titulo",
        image: "Debes ingresar una imagen",
        audio: "Debes seleccionar un archivo de audio"
      },
      actions: {
        releaseWork: "Publicar Trabajo",
        showAdvanced: "Mostrar opciones avanzadas",
        hideAdvanced: "Ocultar opciones avanzadas",
      }
    },
    editorView: {
      headers: {
        contributors: 'Colaboradores',
        royalties: 'Regalias',
      },
      labels: {
        price: 'precio (en ether)',
        addContributor: 'añadir colaborador',
        addRoyalty: 'añadir regalia',
      },
      price: 'Precio',
      ppp: 'PPP',
      shares: 'acciones',
    },
    parityView: {
      defaultAccount: 'Mi cuenta por defecto es ',
      allAccounts: 'Todas las cuentas ',
      myBalanceIs: 'Mi balance es ',
      mining: 'Minando: ',
      myCoinbaseIs: 'Mi coinbase es ',
      connected: 'Conectado: ',
      syncing: 'sincronizando: ',
      status: 'Status: ',
      balance: 'Balance: ',
      tx:'tx: ',
      receipt:'recibo: ',
      buttons: {
        refreshStatus: 'Conectado: ',
        clear: 'Borrar',
        checkBalance: 'verificar saldo',
        createAccount: 'crear cuenta',
        showMyMinedBlocks: 'mostrar mis bloques minados',
        showBlock: 'mostrar bloque',
        checkTransaction: 'verificar transaccion',
      },
    },
    playlistsView: {
      instructions: "Presiona el simbolo '+' para añadir una playlist"
    },
    artistView: {
      labels: {
        follow: "seguir",
        following: "siguiendo",
        tip: "tip",
        tipPending: "...",
        tipFailed: ":(",
        tipSuccess: ":)"
      }
    },
    userProfileView: {
      messages: {
        NewUser:"Registra tu cuenta en el sitio de Musicoin para activar el Modo Musicoin",
        Confirm:"Ya casi estas ahi! Confirma tu cuenta enviando un pequeño pago a Musicoin.",
        Registered:"Una vez tu cuenta sea verificada, la musica que publiques aparecera automaticamente en el catalogo publico",
        Verified:"Tu cuenta esta verificada.",
        Visit: "Visita el sitio web de Musicoin.org para registrar tu cuenta o unirse a la conversacion."
      },
      actions: {
        NewUser:"Registrar tu cuenta",
        Confirm:"Confirmar tu cuenta",
        Registered:"Aprende mas",
        Verified:"Empezar!",
        Mining:"Conmutar Mineria"
      }
    },
    simpleLogin: {
      labels: {
        selectAccount: "Selecciona una cuenta"
      }
    },
    connectionWatch: {
      chainReady:'Conectado a MusicChain',
      chainNotReady:'No conectado a MusicChain',
      ipfsReady:'Conectado a IPFS',
      ipfsNotReady:'No conectado a IPFS',
      serverReady:'Conectado al servidor',
      serverNotReady:'No conectado al servidor',
    },
    accountCreateConfirmDialog: {
      header:'Proporcione una contraseña para proteger su cuenta',
      description:'Proporcione una contraseña en el cuadro de entrada y presione Enter cuando termine.',
      password:'contraseña',
      cancel:'cancelar',
      success:'Exito',
      errorOnInit:'Hubo un error mientras se intentaba llamar al backend de la aplicacion',
      errorInProcessing:'There was an error during processing your request.\nPlease try again or consult this error on musicoin.org support forum\n\nClick or tap anywhere around to dismiss this message.',
      errorInProcessing:'Hubo un error mientras se procesaba su solicitud.\nPor favor intente de nuevo o consulte este error en el foro de soporte de musicoin.org \n\nPresiona donde sea para cerrar este mensaje.',

    },
    accountSelector: {
      roles:{
        coinbase: 'Coinbase',
        mainPrivate: 'Principal Privado',
        appBuiltIn: 'Implementado en la aplicacion',
      },
      placeholder: 'seleccione una existente o crear una nueva',
      createNew: 'crear una cuenta nueva',
    },
    general: {
      favorites: "Mis favoritos"
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
  },es:{
    navMenu:{
      headers:{
        categories:'Categorias',
        playlist:'Playlists',
        musician:'Musico',
        developer:'Desarrollador',
        account:'Cuenta'
      },
      items:{
        newReleases:'Nuevos Lanzamientos',
        coinboard:'Tablero de Moneda',
        myFavorites:'Mis Favoritos',
        myPlaylists:'Mis Playlists',
        collection:'Coleccion',
        myWorks:'Mis Trabajos',
        myProfile:'Mi perfil',
        editor:'Editor',
        utilities:'Utilidades',
        wallet:'Billetera',
        settings:'Ajustes',
        following:'Siguiendo',
        history:'Historial'
      }
    },
    layeredMenu:[
      {user:true, header:{name:'user',shortcut:'usr',icon:''},items:[
        {name:'Ajustes',shortcut:'set'},
        {name:'Crear cuenta |temp|',shortcut:'acc'},
        {name:'Salir',shortcut:'loo'},
      ]},
      {dynamic:true, header:{name:'Categorias',shortcut:'cat',icon:'catalogicon'},items:[
        {name:'Nuevos Lanzamientos',shortcut:'rel'},
        {name:'Tablero de Moneda',shortcut:'cbr'},
      ]},
      {header:{name:'Playlist',shortcut:'pls',icon:'playlisticon'},items:[
        {name:'Mis favoritos',shortcut:'myf'},
        {name:'Mis playlists',shortcut:'mpl'},
      ]},
      {header:{name:'Musico',shortcut:'mus',icon:'musicianicon'},items:[
        {name:'Mis Trabajos',shortcut:'myw'},
      ]},
      {header:{name:'Desarrollador',shortcut:'dev',icon:'developericon'},items:[
        {name:'Utilidades',shortcut:'uti'},
      ]},
    ],
    paymentApprovalDialog: {
      confirmDisposition:'Confirmar pago de ♮',
      confirmationMessage:'bla, bla',
      acceptPayment:'Aceptar',
      declinePayment:'Rechazar',
    },
    playView: {
      playAll:'playAll',
      addContract:'Añadir',
      pausePlay:'Pausar',
      status:'status:',
    },
    worksView: {
      headers: {
        myWorks: 'Mis Trabajos',
        assets: 'Activos',
        licensing: 'Licencia',
        contributorShares: 'Acciones de Colaborador',
        developerTools: 'Herramientas de Desarrollador',
      },
      buttons: {
        upload: 'Subir',
        release: 'Liberar',
      },
    },
    historyView: {
      label: {
        recentTransactions: "Transacciones Recientes"
      }
    },
    walletView: {
      label: {
        history: "Historial",
        balance: "Balance",
        send: "Enviar",
        to: "a"
      },
      instructions: {
        enterAddress: "ingrese una direccion"
      }
    },
    workDetailView: {
      label: {
        pending: "Pendiente...",
        plays: "Plays",
        tips: "Tips",
        earned: "Ganado",
        releaseDate: "Publicado el"
      }
    },
    workEditor: {
      instructions: {
        selectImage: "presiona para seleccionar una imagen",
        addNewLicense: "Presiona el simbolo "+" para añadir una nueva licencia."
      },
      workTypes: {
        score: "Partitura",
        lyrics: "Letra",
        recording: "Grabacion"
      },
      fields: {
        title: "Titulo",
        artist: "Artista",
        workType: "Typo de Trabajo",
        licenses: "Licencias"
      },
      validation: {
        artist: "Debes ingresar un nombre de artista",
        title: "Debes ingresar un titulo",
        image: "Debes ingresar una imagen",
        audio: "Debes seleccionar un archivo de audio"
      },
      actions: {
        releaseWork: "Publicar Trabajo",
        showAdvanced: "Mostrar opciones avanzadas",
        hideAdvanced: "Ocultar opciones avanzadas",
      }
    },
    editorView: {
      headers: {
        contributors: 'Colaboradores',
        royalties: 'Regalias',
      },
      labels: {
        price: 'precio (en ether)',
        addContributor: 'añadir colaborador',
        addRoyalty: 'añadir regalia',
      },
      price: 'Precio',
      ppp: 'PPP',
      shares: 'acciones',
    },
    parityView: {
      defaultAccount: 'Mi cuenta por defecto es ',
      allAccounts: 'Todas las cuentas ',
      myBalanceIs: 'Mi balance es ',
      mining: 'Minando: ',
      myCoinbaseIs: 'Mi coinbase es ',
      connected: 'Conectado: ',
      syncing: 'sincronizando: ',
      status: 'Status: ',
      balance: 'Balance: ',
      tx:'tx: ',
      receipt:'recibo: ',
      buttons: {
        refreshStatus: 'Conectado: ',
        clear: 'Borrar',
        checkBalance: 'verificar saldo',
        createAccount: 'crear cuenta',
        showMyMinedBlocks: 'mostrar mis bloques minados',
        showBlock: 'mostrar bloque',
        checkTransaction: 'verificar transaccion',
      },
    },
    playlistsView: {
      instructions: "Presiona el simbolo '+' para añadir una playlist"
    },
    artistView: {
      labels: {
        follow: "seguir",
        following: "siguiendo",
        tip: "tip",
        tipPending: "...",
        tipFailed: ":(",
        tipSuccess: ":)"
      }
    },
    userProfileView: {
      messages: {
        NewUser:"Registra tu cuenta en el sitio de Musicoin para activar el Modo Musicoin",
        Confirm:"Ya casi estas ahi! Confirma tu cuenta enviando un pequeño pago a Musicoin.",
        Registered:"Una vez tu cuenta sea verificada, la musica que publiques aparecera automaticamente en el catalogo publico",
        Verified:"Tu cuenta esta verificada.",
        Visit: "Visita el sitio web de Musicoin.org para registrar tu cuenta o unirse a la conversacion."
      },
      actions: {
        NewUser:"Registrar tu cuenta",
        Confirm:"Confirmar tu cuenta",
        Registered:"Aprende mas",
        Verified:"Empezar!",
        Mining:"Conmutar Mineria"
      }
    },
    simpleLogin: {
      labels: {
        selectAccount: "Selecciona una cuenta"
      }
    },
    connectionWatch: {
      chainReady:'Conectado a MusicChain',
      chainNotReady:'No conectado a MusicChain',
      ipfsReady:'Conectado a IPFS',
      ipfsNotReady:'No conectado a IPFS',
      serverReady:'Conectado al servidor',
      serverNotReady:'No conectado al servidor',
    },
    accountCreateConfirmDialog: {
      header:'Proporcione una contraseña para proteger su cuenta',
      description:'Proporcione una contraseña en el cuadro de entrada y presione Enter cuando termine.',
      password:'contraseña',
      cancel:'cancelar',
      success:'Exito',
      errorOnInit:'Hubo un error mientras se intentaba llamar al backend de la aplicacion',
      errorInProcessing:'There was an error during processing your request.\nPlease try again or consult this error on musicoin.org support forum\n\nClick or tap anywhere around to dismiss this message.',
      errorInProcessing:'Hubo un error mientras se procesaba su solicitud.\nPor favor intente de nuevo o consulte este error en el foro de soporte de musicoin.org \n\nPresiona donde sea para cerrar este mensaje.',

    },
    accountSelector: {
      roles:{
        coinbase: 'Coinbase',
        mainPrivate: 'Principal Privado',
        appBuiltIn: 'Implementado en la aplicacion',
      },
      placeholder: 'seleccione una existente o crear una nueva',
      createNew: 'crear una cuenta nueva',
    },
    general: {
      favorites: "Mis favoritos"
    }
  }
}

module.exports = locale;//
