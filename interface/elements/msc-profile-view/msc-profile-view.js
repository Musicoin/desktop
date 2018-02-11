var gui = require('nw.gui');
var fs = require('fs-extra');
var path = require('path');
var os = require('os');
var Finder = require('fs-finder');
var jayson = require('jayson');
var _ = require('lodash');
var ntpClient = require('ntp-client');
var platform = os.platform();
var rp = require('request-promise-native');
var nwin = gui.Window.get();
var blockies = require('ethereum-blockies');
var ethers = require('ethers');
var zxcvbn = require('zxcvbn');
var QRCode = require('qrcode');
var jsQR = require("jsqr");
Polymer({
  is: 'msc-profile-view',
  properties: {
    accounts: Array,
    username: String,
    userImage: String,
    userImageFrom: String,
    userImageRecipient: String,
    paperImage: String,
    userAccount: String,
    recipientAccount: String,
    userBalance: String,
    sendBalance: String,
    locale: Object,
    txStatus: String,
    musicUsd: String,
    musicBtc: String,
    getAccounts: Array,
    nodeId: String,
    actionState: {
      type: String,
      value: "None"
    }
  },
  attached: function() {},
  ready: function() {
    mscIntf.attach(this)
      .to('syncStatus')
      .to('locale')
      .to('syncStatus', function(oldValue, newValue) {
        if (newValue) {
          this.$.isMining.checked = newValue.mining;
        }
      }.bind(this));

    mscIntf.financialData.attach(this)
      .to('accounts')
      .to('coinbase');

    mscIntf.userPreferences.attach(this)
      .to('username')

    this.nodeId = "Fetching...";
    mscIntf.accountModule.getNodeId()
      .then(result => {
        this.nodeId = result;
      });
  },
  _updateUserName: function() {},

  changeCoinbase: function(e) {
    mscIntf.accountModule.setCoinbase(e.model.account.address);
  },
  toggleMiningState: function() {
    if (this.$.isMining.checked) {
      mscIntf.accountModule.startMining();
    } else {
      mscIntf.accountModule.stopMining();
    }
  },
  _computeCheckboxIcon: function(value) {
    return value ? "icons:check-box" : "icons:check-box-outline-blank";
  },
  handleNewAccount: function() {
    this.$.newAccountDialog.open();
  },
  handleAddPeer: function() {
    this.$.addPeerDialog.open();
  },
  backupWallet: function() {
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore';
      } else if (platform.includes("linux")) {  //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore';
      }
      var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "You need to KNOW password for every account to unlock it." +
        " You can locate your accounts in: " + pathOfKey + " directory."};
      new Notification("Please backup your accounts in a safe place", alert);
      gui.Shell.showItemInFolder(pathOfKey);
  },
  gmcOverwriteCache: function(size) {
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var defaultCache = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\config\\config.std.js';
        var newCache =  process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\config\\' + 'config.' + size + '.js';
      } else if (platform.includes("win32")) {
        var defaultCache = process.env.APPDATA + '\\Musicoin\\config\\config.std.js';
        var newCache =  process.env.APPDATA + '\\Musicoin\\config\\' + 'config.' + size + '.js';
      } else if (platform.includes("darwin")) {
        var defaultCache = process.env.HOME + '/Library/Musicoin/config/config.std.js';
        var newCache =  process.env.HOME + '/Library/Musicoin/config/' + 'config.' + size + '.js';
      } else if (platform.includes("linux")) {  //linux
        var defaultCache = process.env.HOME + '/.musicoin/config/config.std.js';
        var newCache =  process.env.HOME + '/.musicoin/config/' + 'config.' + size + '.js';
      }

    fs.copy(newCache, defaultCache, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
  },
  gmcOverwriteCacheDialog: function() {
      this.$.gmcOverwriteCache.open();
  },
  handleSetCustomCoinbase: function() {
    this.$.setCoinbaseDialog.open();
  },
  importAny: function() {
    this.$.importAnyDialog.open();
  },
  addExistingAccount: function() {
    document.getElementById('fileDialog').click();
    document.querySelector('#fileDialog').addEventListener("change", function() {
    var filePath = this.value;
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\' + path.basename(filePath);
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\' + path.basename(filePath);
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/' + path.basename(filePath);
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/' + path.basename(filePath);
      }
    fs.copy(filePath, pathOfKey, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
  });
  },
  showSendDialog: function() {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {icon: iconPath, body: "Send function locked until wallet is in sync."};
    if (this.syncStatus.initialSyncEnded == true) {
      this.getAccounts = mscIntf.accountModule.getAccounts();
      this.$.sendDialogMenu.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification("Send function locked", alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification("Gmc not started synchronization yet", alert);
    } else {
      this.getAccounts = mscIntf.accountModule.getAccounts();
      this.$.sendDialogMenu.open();
    }
  },
  showSendDialogFromAccount: function() {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {icon: iconPath, body: "Send function locked until wallet is in sync."};
    if (this.syncStatus.initialSyncEnded == true) {
      this.$.senderAccount.value = document.getElementById('AccountDialog').textContent;
      this.$.sendDialogFromAccount.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification("Send function locked", alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification("Gmc not started synchronization yet", alert);
    } else {
      this.$.senderAccount.value = document.getElementById('AccountDialog').textContent;
      this.$.sendDialogFromAccount.open();
    }
  },
  restoreDefaultNodeList: function() {
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var oldList = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json.org';
        var actualtList = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
      } else if (platform.includes("win32")) {
        var oldList = process.env.APPDATA + '\\Musicoin\\bootnodes.json.org';
        var actualtList = process.env.APPDATA + '\\Musicoin\\bootnodes.json';
      } else if (platform.includes("darwin")) {
        var oldList = process.env.HOME + '/Library/Musicoin/bootnodes.json.org';
        var actualtList = process.env.HOME + '/Library/Musicoin/bootnodes.json';
      } else if (platform.includes("linux")) { //linux
        var oldList = process.env.HOME + '/.musicoin/bootnodes.json.org';
        var actualtList = process.env.HOME + '/.musicoin/bootnodes.json';
      }

    fs.copy(oldList, actualtList, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
  },
  backupAccount: function(e) {
    var account = e.model.account.address;
    document.getElementById('fileDialogBackup-' + account).click();
    document.querySelector('#fileDialogBackup-' + account).addEventListener("change", function() {
    var tmpPath = this.value;
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
       icon: iconPath,
       body: "You need to KNOW password for every account to unlock it." +
       " You can locate your account in: \n" + tmpPath + " directory."};
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
      pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
      var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
      fs.copy(String(pathOfAccount), filePath);
      document.getElementById('fileDialogBackup-' + account).value = "";
      // Fires double notifications, when same account selected again
      new Notification("Backup in " + tmpPath, alert);
  });
  },
  backupAccountFromDialog: function() {
    var account = document.getElementById('AccountDialog').textContent;
    document.getElementById('fileDialogBackupAccount-' + account).click();
    document.querySelector('#fileDialogBackupAccount-' + account).addEventListener("change", function() {
    var tmpPath = this.value;
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
       icon: iconPath,
       body: "You need to KNOW password for every account to unlock it." +
       " You can locate your account in: \n" + tmpPath + " directory."};
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
    fs.copy(String(pathOfAccount), filePath);
    document.getElementById('fileDialogBackupAccount-' + account).value = "";
    // Fires double notifications, when same account selected again
    new Notification("Backup in " + tmpPath, alert);
  });
  },
  paperWallet: function() {
    this.$.showAccountDetailsDialog.close();
    document.querySelector("msc-profile-view").createQRCode();
    var account = document.getElementById('AccountDialog').textContent;
    this.userAccount = account;
    this.$.paperWalletDialog.open();
  },
  createQRCode: function() {
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    var account = document.getElementById('AccountDialog').textContent;
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    QRCode.toDataURL((fs.readFileSync((String(pathOfAccount)), {encoding: 'utf-8'})), {errorCorrectionLevel: 'H'})
      .then(result => this.paperImage = result)
      .catch(error => console.log(error));
  },
  exportQRCode: function() {
    var account = document.getElementById('AccountDialog').textContent;
    var paperImage = document.getElementById('paper-wallet').src;
    document.getElementById('fileDialogPaper-' + account).click();
    document.querySelector('#fileDialogPaper-' + account).addEventListener("change", function() {
    var tmpPath = document.getElementById('fileDialogPaper-' + account).value;
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
       icon: iconPath,
       body: "As we make QR code from the UTC/JSON file." +
       " You still need a password to access account"};
    var imgName  = ('UTC--' + new Date().toISOString() + '--' + account).split(':').join('-');
    var base64Data = paperImage.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    var filePath = "";
    var filePath = tmpPath + '/' + imgName + '.png';
    fs.writeFile(filePath, base64Data, {encoding: 'base64'});
    new Notification("QR Code Backup in " + tmpPath, alert);
    document.getElementById('fileDialogPaper-' + account).value = "";
  });
  this.$.paperWalletDialog.close();
  },
  clearPaperWallet: function() {
    document.getElementById('paper-wallet').src = "";
  },
  paperWalletImport: function() {
    this.$.paperWalletImportDialog.open();
    this.$.importAnyDialog.close();
  },
  decodeQRCode: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
      }
    png = new (require('pngjs').PNG)();
    document.getElementById('fileDialogPaperImport').click();
    document.querySelector('#fileDialogPaperImport').addEventListener("change", function() {
    var PaperWallet = document.getElementById('fileDialogPaperImport').value;
    png.parse(fs.readFileSync(PaperWallet), function(err, decodedPng) {
    if(err) {
      alert("Incorrect PNG file.");
      //console.log(err);
    }
    var code = jsQR(decodedPng.data, decodedPng.width, decodedPng.height);
    var wallet = JSON.parse(code.data);
    var accountName  = (new Date().toISOString() + '--' + wallet.address).split(':').join('-');
    pathOfKey = pathOfKey + accountName;
    fs.writeFile(pathOfKey, code.data, 'utf-8');
    document.getElementById('fileDialogPaperImport').value = "";
   });
 });
  this.$.paperWalletImportDialog.close();
  },
  clearPaperWalletImport: function() {
    document.getElementById('fileDialogPaperImport').value = "";
  },
  showExplorerWindow: function(e) {
    gui.Window.open('https://explorer.musicoin.org/account/' + e.model.account.address,{position: 'center', width: 1000, height: 600});
  },
  showExplorerWindowFromDialog: function() {
    var account = document.getElementById('AccountDialog').textContent;
    gui.Window.open('https://explorer.musicoin.org/account/' + account,{position: 'center', width: 1000, height: 600});
  },
  activePeers: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
    var pathOfNodes = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
    } else if (platform.includes("win32")) {
    var pathOfNodes = process.env.APPDATA + '\\Musicoin\\bootnodes.json';
    } else if (platform.includes("darwin")) {
    var pathOfNodes = process.env.HOME + '/Library/Musicoin/bootnodes.json';
    } else if (platform.includes("linux")) { //linux
    var pathOfNodes = process.env.HOME + '/.musicoin/bootnodes.json';
    }
    var bootnodes = JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    var client = jayson.client.http('http://localhost:8545');
    client.request('admin_peers', [], function(err, response) {
      if(err) throw err;
    var aPeers = JSON.parse(JSON.stringify(response.result));
    for(var i = 0; i < aPeers.length; i++) {
    document.querySelector("msc-profile-view").addOrRemove(bootnodes.nodes, "enode://" + aPeers[i].id + "@" + aPeers[i].network.remoteAddress);
    fs.writeFile(pathOfNodes, JSON.stringify(bootnodes, null, 4), 'utf-8');
    }
    });
  },
  addOrRemove: function(arr, val) {
    if (!_.includes(arr, val)) {
    arr.unshift(val);
    } else {
    _.union(arr, [val]);
    }
  },
  maxWindow: function() {
    if ( nwin.width > 1000 ) {
      document.getElementById('unmaximize').style.display = 'none';
      document.getElementById('maximize').style.display = '';
      nwin.restore();
      } else {
      nwin.maximize();
      document.getElementById('maximize').style.display = 'none';
      document.getElementById('unmaximize').style.display = ''
    }
  },
  muteAudio: function() {
    document.getElementById('mute').style.display = 'none';
    document.getElementById('unmute').style.display = '';
    var webview = document.getElementById('mPlayer');
    webview.executeScript({ code: "audio = document.getElementById('playerFrame').contentWindow.document.getElementsByTagName('audio'); for (var j = 0; j < audio.length; j++) {audio[j].muted = true;}" });
  },
  unmuteAudio: function() {
    document.getElementById('unmute').style.display = 'none';
    document.getElementById('mute').style.display = '';
    var webview = document.getElementById('mPlayer');
    webview.executeScript({ code: "audio = document.getElementById('playerFrame').contentWindow.document.getElementsByTagName('audio'); for (var j = 0; j < audio.length; j++) {audio[j].muted = false;}" });
  },
  webviewDetectChange: function() {
    var webview = document.getElementById('mPlayer');
    webview.executeScript({ code: "cover = document.getElementById('playerFrame').contentWindow.document.getElementById('player-badge-image'); trackCover = 'https://musicoin.org' + cover.getAttribute('src'); title = document.getElementById('playerFrame').contentWindow.document.getElementById('player-title').textContent; artist = document.getElementById('playerFrame').contentWindow.document.getElementById('player-artist').textContent; playTime = document.getElementById('playerFrame').contentWindow.document.getElementById('player-time-played').textContent; var alert = { icon: trackCover, body: artist }; if (playTime != '00:00' && playTime < '00:03') new Notification(title, alert);" });
  },
  showAccountDetails: function(e) {
    var account = e.model.account.address;
    this.userAccount = account;
    this.userBalance = document.getElementById(account).textContent;
    this.userImage = blockies.create({ seed:account, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.$.showAccountDetailsDialog.open();
  },
  approveSend: function() {
    account = document.getElementById('sender').value;
    recipient = document.getElementById('recipient').value;
    this.userAccount = account;
    this.recipientAccount = recipient;
    this.sendBalance = document.getElementById('coins').value + ' MUSIC';
    this.userImageFrom = blockies.create({ seed:account, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.userImageRecipient = blockies.create({ seed:recipient, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.$.approveSendDialog.open();
  },
  approveSendAccount: function() {
    account = document.getElementById('senderAccount').value;
    recipient = document.getElementById('recipientAccount').value;
    this.userAccount = account;
    this.recipientAccount = recipient;
    this.sendBalance = document.getElementById('coinsAccount').value + ' MUSIC';
    this.userImageFrom = blockies.create({ seed:account, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.userImageRecipient = blockies.create({ seed:recipient, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.$.approveSendDialogAccount.open();
  },
  addPeers: function(e) {
   if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
    var pathOfNodes = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
    } else if (platform.includes("win32")) {
    var pathOfNodes = process.env.APPDATA + '\\Musicoin\\bootnodes.json';
    } else if (platform.includes("darwin")) {
    var pathOfNodes = process.env.HOME + '/Library/Musicoin/bootnodes.json';
    } else if (platform.includes("linux")) { //linux
    var pathOfNodes = process.env.HOME + '/.musicoin/bootnodes.json';
    }
    var obj = JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    var remoteNodes = [];
    for(var i = 0; i< obj['nodes'].length; i++) {
      remoteNodes.push(obj['nodes'][i]);
    }
    //console.log(remoteNodes);
    mscIntf.accountModule.getNodeId()
      .then(result => {
        this.nodeId = result;
      });
    var addresses = this.$.newPeerEnodeAddress.value;
    if (addresses) {
      var array = addresses.split(/[\n ,;]+/).map(s => s.trim()).filter(s => s)
        .map(peer => {
          if (peer.startsWith("admin.addPeer(") && peer.endsWith(")"))
            return peer.substring(15, peer.length - 2);
          return peer;
        })
      var finArray = array.concat(remoteNodes);
      if (array.length > 0) {
        mscIntf.accountModule.addPeers(finArray)
          .then(() => this.txStatus = "Connecting " + array.length + " peers along with default remote Nodes")
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = "Failed to add peer: " + err);
      } else {
        mscIntf.accountModule.addPeers(remoteNodes)
          .then(() => this.txStatus = "Default list of remote nodes loaded")
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = "Failed to load default list: " + err);
      }
      this.$.addPeerDialog.close();
      return;
    } else {
      this.txStatus = "No manual enodes provided. Loading default remote Node list";
      mscIntf.accountModule.addPeers(remoteNodes)
        .then(() => this.txStatus = "Default list of remote nodes loaded")
        .delay(5000)
        .then(() => this.txStatus = "")
        .catch(err => this.txStatus = "Failed to load default list: " + err);
      this.$.addPeerDialog.close();
      return;
    }
  },
  createNewAccount: function() {
    var v1 = this.$.newAccountPassword.value;
    var v2 = this.$.newAccountPasswordVerify.value;
    if (v1 == v2 && v1.length > 0 && zxcvbn(v1).score >= 2 ) {
      mscIntf.accountModule.createAccount(this.$.newAccountPassword.value)
        .then(account => this.txStatus = "Created account: " + account)
        .catch(err => this.txStatus = "Failed to create account: " + err);
      this.clearNewAccountFields();
      this.$.newAccountDialog.close();
      this.$.createNewAccountDialog.close();
    } else if (v1 != v2) {
        this.clearNewAccountFields();
        alert("Password does not match the confirm password");
    } else if (v1 == v2 && v1.length == 0) {
        this.clearNewAccountFields();
        alert("Password was empty!");
    } else if (zxcvbn(v1).score < 2) {
        this.clearNewAccountFields();
        alert("Password too easy to guess");
    } else {
      this.clearNewAccountFields();
      return false;
    }
  },
  unlockPrivateKeyFromAccount: function() {
    var account = document.getElementById('AccountDialog').textContent;
    document.getElementById('sourceAccount').value = account;
    this.$.unlockPrivateKeyDialog.open();
  },
  showPrivateKey: function() {
    var account = document.getElementById('sourceAccount').value;
    var password = document.getElementById('unlockAccount').value;
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    var accountFile = JSON.stringify(JSON.parse(fs.readFileSync((String(pathOfAccount)), 'utf-8')));
    ethers.Wallet.fromEncryptedWallet(accountFile, password)
      .then(wallet => alert(wallet.privateKey))
      .catch(err => alert(err));
    this.clearPrivateKey();
  },
  clearPrivateKey: function() {
    document.getElementById('sourceAccount').value = "";
    document.getElementById('unlockAccount').value = "";
  },
  createNewAccountDialog: function() {
    this.$.createNewAccountDialog.open();
  },
  createKeyFromPrivateKey: function() {
    this.$.createKeyFromPrivateKey.open();
  },
  clearKeyFromPrivateKey: function() {
    document.getElementById('dummyKey').value = "";
    document.getElementById('dummyPassword').value = "";
  },
  createKeyFromPrivateKeyAction: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
      }
    var privateKey = (document.getElementById('dummyKey').value).replace(/\s+/g, '');
    var password = document.getElementById('dummyPassword').value;
    if (password.length > 0 && zxcvbn(password).score >= 2 && privateKey.length > 0 && privateKey.includes("0x") && privateKey.length <= 66 && privateKey.length >= 62 && privateKey != password) {
      var wallet = new ethers.Wallet(privateKey);
      wallet.encrypt(password, { scrypt: { N: 262144 } }).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
	accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFile(pathOfKey, finalAccount, 'utf-8'); });
        this.clearKeyFromPrivateKey();
        this.$.importAnyDialog.close();
      } else if (password.length > 0 && zxcvbn(password).score >= 2 && privateKey.length <= 64 && privateKey.length >= 60 && privateKey != password) {
        var wallet = new ethers.Wallet("0x" + privateKey);
        wallet.encrypt(password).then(function(finalAccount) {
          finalAccountTmp = JSON.parse(finalAccount);
          account = finalAccountTmp.address;
          accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
          pathOfKey = pathOfKey + accountName;
          fs.writeFile(pathOfKey, finalAccount, 'utf-8'); });
        this.clearKeyFromPrivateKey();
        this.$.importAnyDialog.close();
      } else if (password.length = 0) {
          this.clearKeyFromPrivateKey();
        alert("Password was empty");
      } else if (zxcvbn(password).score < 2) {
          this.clearKeyFromPrivateKey();
        alert("Password too easy to guess");
      } else if (privateKey = password) {
          this.clearKeyFromPrivateKey();
        alert("Using same password as private key is a bad idea");
      } else {
        this.clearKeyFromPrivateKey();
        alert("Incorrect private key provided");
      }
  },
  createKeyFromMnemonic: function() {
    this.$.createKeyFromMnemonic.open();
  },
  createKeyFromMnemonicAction: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
      }
    var password = document.getElementById('mnemonicPassword').value;
    var mnemonic = (document.getElementById('mnemonic').value).toLowerCase();
    if (password.length > 0 && password.length < 65 && zxcvbn(password).score >= 2) {
      var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
      wallet.encrypt(password, { scrypt: { N: 262144 } }).then(function(finalAccount) {
      finalAccountTmp = JSON.parse(finalAccount);
      account = finalAccountTmp.address;
      accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
      pathOfKey = pathOfKey + accountName;
      fs.writeFile(pathOfKey, finalAccount, 'utf-8'); });
      this.clearKeyFromMnemonic();
      this.$.importAnyDialog.close();
    } else if (password.length = 0) {
        this.clearKeyFromMnemonic();
        alert("Password was empty!");
    } else if (password.length > 64) {
        this.clearKeyFromMnemonic();
        alert("We can't use password longer more than 64 bytes, due bug in scrypt-js\nIn case you want more stronger password, consider using \n<Create Account> instead of <Create Mnemonic Account>\nYou can find full description here:\n https://github.com/ricmoo/scrypt-js/issues/11");
    } else if (zxcvbn(password).score < 2) {
        this.clearKeyFromMnemonic();
        alert("Password too easy to guess");
    } else {
        this.clearKeyFromMnemonic();
        return false;
    }
  },
  clearKeyFromMnemonic: function() {
    document.getElementById('mnemonic').value = "";
    document.getElementById('mnemonicPassword').value = "";
  },
  createNewAccountDialog: function() {
    this.$.createNewAccountDialog.open();
  },
  handleMnemonicAccount: function() {
    this.$.newMnemonicAccountDialog.open();
  },
  createNewMnemonicAccount: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
      }
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var mnemonicNotification = {
        icon: iconPath,
        body: "Please save the phrase (mnemonic) in the safe place in order to retrieve your account in case of any failure"};
    var password1 = document.getElementById('newAccountPasswordMnemonic').value;
    var password2 = document.getElementById('newAccountPasswordMnemonicVerify').value;
    if (password1 == password2 && password1.length > 0 && password1.length < 65 && zxcvbn(password1).score >= 2) {
      // It's important to show Notification before mnemonic generation, otherwise we would see alert first
      new Notification("Save mnemonic", mnemonicNotification);
      var mnemonic = ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
      var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
      wallet.encrypt(password1, { scrypt: { N: 262144 } }).then(function(finalAccount) {
      finalAccountTmp = JSON.parse(finalAccount);
      account = finalAccountTmp.address;
      // finalAccountTmp["x-ethers"].gethFilename works only vs mnemonic creation, so kinda useless
      accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
      pathOfKey = pathOfKey + accountName;
      fs.writeFile(pathOfKey, finalAccount, 'utf-8');
      alert(mnemonic); });
      this.clearNewAccountFieldsMnemonic();
      this.$.newMnemonicAccountDialog.close();
      this.$.createNewAccountDialog.close();
    } else if (password1 != password2) {
        this.clearNewAccountFieldsMnemonic();
        alert("Password does not match the confirm password");
    } else if (password1 == password2 && password1.length == 0) {
        this.clearNewAccountFieldsMnemonic();
        alert("Password was empty!");
    } else if (password1 == password2 && password1.length > 64) {
        this.clearNewAccountFieldsMnemonic();
        alert("We can't use password longer more than 64 bytes, due bug in scrypt-js\nIn case you want more stronger password, consider using \n<Create Account> instead of <Create Mnemonic Account>\nYou can find full description here:\n https://github.com/ricmoo/scrypt-js/issues/11");
    } else if (password1 == password2 && zxcvbn(password1).score < 2) {
        this.clearNewAccountFieldsMnemonic();
        alert("Password too easy to guess");
    } else {
        this.clearNewAccountFieldsMnemonic();
        return false;
    }
  },
  approveRemoveAccount: function() {
    var account = document.getElementById('AccountDialog').textContent;
    document.getElementById('sourceAccountRemove').value = account;
    this.userBalance = document.getElementById(account).textContent;
    this.userImage = blockies.create({ seed:account, size: 8, scale: 16, color: '#f2c455', bgcolor: '#fff'}).toDataURL();
    this.$.approveRemoveAccountDialog.open();
  },
  clearApproveRemoveAccount: function() {
    document.getElementById('sourceAccountRemove').value = "";
    document.getElementById('removePassword').value = "";
  },
  removeAccount: function() {
    var account = document.getElementById('sourceAccountRemove').value;
    var password = document.getElementById('removePassword').value;
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    var accountFile = JSON.stringify(JSON.parse(fs.readFileSync((String(pathOfAccount)), 'utf-8')));
    ethers.Wallet.fromEncryptedWallet(accountFile, password).then(function(wallet) {
    if(wallet.address = account) fs.unlinkSync((String(pathOfAccount)));
    }).catch(function(err) { alert(err); });
    document.getElementById('sourceAccountRemove').value = "";
    document.getElementById('removePassword').value = "";
    this.$.showAccountDetailsDialog.close();
  },
  getMarketValue: function() {
    var CoinMarketCapUrl = "https://api.coinmarketcap.com/v1/ticker/musicoin/?limit=1";
    rp({url: CoinMarketCapUrl, json: true})
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(usd => this.musicUsd = usd[0].price_usd)
      .catch(error => this.musicUsd = "API Connection Failed");
    rp({url: CoinMarketCapUrl, json: true})
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(btc => this.musicBtc = btc[0].price_btc)
      .catch(error => this.musicBtc = "API Connection Failed");
  },
  marketRates: function() {
    document.querySelector("msc-profile-view").getMarketValue();
    this.$.marketRatesDialog.open();
  },
  displayBalanceInBtc: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i=0;i<accountMusic.length;i+=1){accountMusic[i].style.display = 'none';}
    for (var i=0;i<accountUsd.length;i+=1){accountUsd[i].style.display = 'none';}
    for (var i=0;i<accountBtc.length;i+=1){accountBtc[i].style.display = '';}
  },
  displayBalanceInUsd: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i=0;i<accountMusic.length;i+=1){accountMusic[i].style.display = 'none';}
    for (var i=0;i<accountBtc.length;i+=1){accountBtc[i].style.display = 'none';}
    for (var i=0;i<accountUsd.length;i+=1){accountUsd[i].style.display = '';}
  },
  displayBalanceInMusic: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i=0;i<accountBtc.length;i+=1){accountBtc[i].style.display = 'none';}
    for (var i=0;i<accountUsd.length;i+=1){accountUsd[i].style.display = 'none';}
    for (var i=0;i<accountMusic.length;i+=1){accountMusic[i].style.display = '';}
  },
  signMsg: function(e) {
    var account = e.model.account.address;
    document.getElementById('signMsgAccount').value = account;
    this.userAccount = account;
    this.$.signMsgDialog.open()
  },
  signMsgFromMenu: function() {
    this.getAccounts = mscIntf.accountModule.getAccounts();
    this.$.signMsgDialogFromMenu.open()
  },
  signMsgAction: function() {
    var account = document.getElementById('signMsgAccount').value;
    var password = document.getElementById('signPassword').value;
    var msg = document.getElementById('signMsg').value;
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    var accountFile = JSON.stringify(JSON.parse(fs.readFileSync((String(pathOfAccount)), 'utf-8')));
    if (msg.length > 0) {
      ethers.Wallet.fromEncryptedWallet(accountFile, password).then(function(wallet) {
      alert(wallet.signMessage(msg)); });
      this.clearSignMsg();
      this.$.signMsgDialog.close();
    } else {
      alert("You want to sign empty message!");
      return false;
    }
  },
  signMsgActionMenu: function() {
    var account = document.getElementById('signMsgAccountMenu').value;
    var password = document.getElementById('signPasswordMenu').value;
    var msg = document.getElementById('signMsgMenu').value;
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    var accountFile = JSON.stringify(JSON.parse(fs.readFileSync((String(pathOfAccount)), 'utf-8')));
    if (msg.length > 0) {
      ethers.Wallet.fromEncryptedWallet(accountFile, password).then(function(wallet) {
      alert(wallet.signMessage(msg)); });
      this.clearSignMsgMenu();
      this.$.signMsgDialogFromMenu.close();
    } else {
      alert("You want to sign empty message");
      return false;
    }
  },
  verifyMsg: function() {
    this.$.verifyMsgDialog.open();
  },
  verifyMsgAction: function() {
    var signature = document.getElementById('signature').value;
    var msgToVerify = document.getElementById('verifyMsg').value;
    var account = document.getElementById('accountVerify').value;
    if (msgToVerify.length > 0 && account.includes("0x") && account.length >= 38 && signature.includes("0x")) {
      var address = ethers.Wallet.verifyMessage(msgToVerify, signature);
      if (address = account) {
      alert("Message was signed with correct account: " + address);
      this.clearVerifyMsg();
      this.$.verifyMsgDialog.close();
      } else {
          alert("Invalid message signature!");
      }
    } else if (msgToVerify.length == 0) {
        alert("Empty message was provided");
    } else if (account.length < 38) {
        document.getElementById('accountVerify').value = "";
        alert("Invalid account was provided");
    } else {
       this.clearVerifyMsg();
       alert("Incorrect details provided(possible reasons):\nNot valid account\nInvalid signature provided");
       return false;
    }
  },
  setCustomCoinbase: function() {
    if (this.$.customCoinbase.value && this.$.customCoinbase.value.trim().length > 0) {
      mscIntf.accountModule.setCoinbase(this.$.customCoinbase.value);
    }
  },
  sendCoins: function() {
    this.txStatus = "Sending coins...";
    mscIntf.accountModule.sendCoins(
      document.getElementById('recipient').value,
      document.getElementById('coins').value,
      document.getElementById('sender').value,
      document.getElementById('sendPassword').value
    ).
    then((tx) => {
        this.txStatus = "Waiting for transaction " + tx;
        return mscIntf.accountModule.waitForTransaction(tx);
      })
      .then(() => {
        this.txStatus = "Success!";
      })
      .delay(5000)
      .then(() => {
        this.txStatus = "";
      })
      .catch((err) => {
        this.txStatus = "Failed to send: " + err;
      });
    this.clearSendFields();
  },
  sendCoinsFromAccount: function() {
    this.txStatus = "Sending coins...";
    mscIntf.accountModule.sendCoins(
      document.getElementById('recipientAccount').value,
      document.getElementById('coinsAccount').value,
      document.getElementById('senderAccount').value,
      document.getElementById('sendPasswordAccount').value
    ).
    then((tx) => {
        this.txStatus = "Waiting for transaction " + tx;
        return mscIntf.accountModule.waitForTransaction(tx);
      })
      .then(() => {
        this.txStatus = "Success!";
      })
      .delay(5000)
      .then(() => {
        this.txStatus = "";
      })
      .catch((err) => {
        this.txStatus = "Failed to send: " + err;
      });
    this.clearSendAccountFields();
  },
  clearSignMsg: function() {
    document.getElementById('signMsgAccount').value = "";
    document.getElementById('signPassword').value = "";
    document.getElementById('signMsg').value = "";
  },
  clearSignMsgMenu: function() {
    document.getElementById('signMsgAccountMenu').value = "";
    document.getElementById('signPasswordMenu').value = "";
    document.getElementById('signMsgMenu').value = "";
  },
  clearVerifyMsg: function() {
    document.getElementById('signature').value = "";
    document.getElementById('verifyMsg').value = "";
    document.getElementById('accountVerify').value = "";
  },
  clearNewAccountFields: function() {
    document.getElementById('newAccountPassword').value = "";
    document.getElementById('newAccountPasswordVerify').value = "";
  },
  clearNewAccountFieldsMnemonic: function() {
    document.getElementById('newAccountPasswordMnemonic').value = "";
    document.getElementById('newAccountPasswordMnemonicVerify').value = "";
  },
  clearSendFields: function() {
    document.getElementById('sender').value = "";
    document.getElementById('recipient').value = "";
    document.getElementById('coins').value = "";
    document.getElementById('sendPassword').value = "";
    document.getElementById('sender').value = "";
  },
  clearSendAccountFields: function() {
    document.getElementById('senderAccount').value = "";
    document.getElementById('recipientAccount').value = "";
    document.getElementById('coinsAccount').value = "";
    document.getElementById('sendPasswordAccount').value = "";
    document.getElementById('senderAccount').value = "";
  },
  patchOverlay: function (e) {
    // hack from: https://stackoverflow.com/a/31510980
    if (e.target.withBackdrop) {
      e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
    }
  }
});

    var menu = new nw.Menu({ type: 'menubar' });
    if (platform.includes("darwin")) {
      menu.createMacBuiltin('Musicoin-wallet',{hideEdit: true, hideWindow: true});
      } else {}
    var account = new nw.Menu();
    account.append(new nw.MenuItem({ label: 'New Account', key: 'n', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").createNewAccountDialog(); } }));
    account.append(new nw.MenuItem({ label: 'Import Account', key: 'i', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").importAny(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Send Funds', key: 's', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").showSendDialog(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Sign', key: 's', modifiers: 'ctrl+cmd', click: function() { document.querySelector("msc-profile-view").signMsgFromMenu(); } }));
    account.append(new nw.MenuItem({ label: 'Verify Message', key: 'v', modifiers: 'ctrl+cmd', click: function() { document.querySelector("msc-profile-view").verifyMsg(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Open Keystore (manual backup)', key: 'b', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").backupWallet(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Quit', key: 'q', modifiers: 'ctrl', click: function() { require('process').exit(0); } }));
    menu.append(new nw.MenuItem({label: 'Account', submenu: account }));
    var explorer = new nw.Menu();
    explorer.append(new nw.MenuItem({ label: 'Open Explorer #1', key: 'e', modifiers: 'ctrl', click: function() { gui.Window.open('https://explorer.musicoin.org/',{position: 'center', width: 1000, height: 600}); } }));
    explorer.append(new nw.MenuItem({ label: 'Open Explorer #2', key: 'e', modifiers: 'ctrl+cmd', click: function() { gui.Window.open('https://orbiter.musicoin.org/',{position: 'center', width: 1000, height: 600}); } }));
    menu.append(new nw.MenuItem({label: 'Explorer', submenu: explorer }));
    var markets = new nw.Menu();
    markets.append(new nw.MenuItem({ label: 'CoinMarketCap Charts', key: 'm', modifiers: 'ctrl+cmd', click: function() { gui.Window.open('https://coinmarketcap.com/currencies/musicoin/#charts',{position: 'center', width: 1000, height: 600}); } }));
    markets.append(new nw.MenuItem({ type: 'separator' }));
    if (platform.includes("darwin")) {
        markets.append(new nw.MenuItem({ label: 'Bittrex: MUSIC/BTC', click: function() { gui.Window.open('https://bittrex.com/Market/Index?MarketName=BTC-MUSIC',{position: 'center', width: 1000, height: 600}); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/BTC', click: function() { gui.Window.open('https://www.cryptopia.co.nz/Exchange?market=MUSIC_BTC',{position: 'center', width: 1000, height: 600}); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/LTC', click: function() { gui.Window.open('https://www.cryptopia.co.nz/Exchange?market=MUSIC_LTC',{position: 'center', width: 1000, height: 600}); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/DOGE', click: function() { gui.Window.open('https://www.cryptopia.co.nz/Exchange?market=MUSIC_DOGE',{position: 'center', width: 1000, height: 600}); } }));
      } else {
        markets.append(new nw.MenuItem({ label: 'Bittrex: MUSIC/BTC', click: function() { gui.Shell.openExternal('https://bittrex.com/Market/Index?MarketName=BTC-MUSIC'); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/BTC', click: function() { gui.Shell.openExternal('https://www.cryptopia.co.nz/Exchange?market=MUSIC_BTC'); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/LTC', click: function() { gui.Shell.openExternal('https://www.cryptopia.co.nz/Exchange?market=MUSIC_LTC'); } }));
        markets.append(new nw.MenuItem({ label: 'Cryptopia: MUSIC/DOGE', click: function() { gui.Shell.openExternal('https://www.cryptopia.co.nz/Exchange?market=MUSIC_DOGE'); } }));
    }
    menu.append(new nw.MenuItem({label: 'Markets', submenu: markets }));
    var official = new nw.Menu();
    official.append(new nw.MenuItem({ label: 'Musicoin', key: 'm', modifiers: 'ctrl', click: function() { gui.Window.open('https://www.musicoin.org/',{position: 'center', width: 1000, height: 600}); } }));
    official.append(new nw.MenuItem({ type: 'separator' }));
    official.append(new nw.MenuItem({ label: 'Bitcointalk: Musicoin', key: 'f', modifiers: 'ctrl+cmd', click: function() { gui.Window.open('https://bitcointalk.org/index.php?topic=1776113.0',{position: 'center', width: 1000, height: 600}); } }));
    official.append(new nw.MenuItem({ type: 'separator' }));
    if (platform.includes("darwin")) {
        official.append(new nw.MenuItem({ label: 'Medium', click: function() { gui.Window.open('https://medium.com/@musicoin',{position: 'center', width: 1000, height: 600}); } }));
        official.append(new nw.MenuItem({ label: 'Twitter', click: function() { gui.Window.open('https://twitter.com/musicoins',{position: 'center', width: 1000, height: 600}); } }));
        official.append(new nw.MenuItem({ label: 'Instagram', click: function() { gui.Window.open('https://www.instagram.com/musicoinofficial/',{position: 'center', width: 1000, height: 600}); } }));
        official.append(new nw.MenuItem({ label: 'Facebook', click: function() { gui.Window.open('https://www.facebook.com/lovemusicoin',{position: 'center', width: 1000, height: 600}); } }));
        official.append(new nw.MenuItem({ label: 'Discord', click: function() { gui.Window.open('https://discord.gg/gA8gjxC',{position: 'center', width: 1000, height: 600}); } }));
      } else {
        official.append(new nw.MenuItem({ label: 'Medium', click: function() { gui.Shell.openExternal('https://medium.com/@musicoin'); } }));
        official.append(new nw.MenuItem({ label: 'Twitter', click: function() { gui.Shell.openExternal('https://twitter.com/musicoins'); } }));
        official.append(new nw.MenuItem({ label: 'Instagram', click: function() { gui.Shell.openExternal('https://www.instagram.com/musicoinofficial/'); } }));
        official.append(new nw.MenuItem({ label: 'Facebook', click: function() { gui.Shell.openExternal('https://www.facebook.com/lovemusicoin'); } }));
        official.append(new nw.MenuItem({ label: 'Discord', click: function() { gui.Shell.openExternal('https://discord.gg/gA8gjxC'); } }));
    }
    official.append(new nw.MenuItem({ type: 'separator' }));
    official.append(new nw.MenuItem({ label: 'GitHub', key: 'g', modifiers: 'ctrl', click: function() { gui.Window.open('https://github.com/Musicoin',{position: 'center', width: 1000, height: 600}); } }));
    menu.append(new nw.MenuItem({label: 'Official', submenu: official }));
    var advanced = new nw.Menu();
    advanced.append(new nw.MenuItem({ label: 'Add Peers', key: 'p', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").handleAddPeer(); } }));
    advanced.append(new nw.MenuItem({ type: 'separator' }));
    advanced.append(new nw.MenuItem({ label: 'Select Gmc cache size', click: function() { document.querySelector("msc-profile-view").gmcOverwriteCacheDialog(); } }));
    advanced.append(new nw.MenuItem({ label: 'Restore default nodes list', click: function() { document.querySelector("msc-profile-view").restoreDefaultNodeList(); } }));
    menu.append(new nw.MenuItem({label: 'Advanced', submenu: advanced }));
    var help = new nw.Menu();
    if (platform.includes("darwin")) {
        help.append(new nw.MenuItem({ label: 'New GitHub Issue', click: function() { gui.Window.open('https://github.com/Musicoin/desktop/issues/new',{position: 'center', width: 1000, height: 600}); } })) ;
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'Discord', click: function() { gui.Window.open('https://discord.gg/gA8gjxC',{position: 'center', width: 1000, height: 600}); } }));
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'How It Works', click: function() { gui.Window.open('https://www.musicoin.org/how-it-works',{position: 'center', width: 1000, height: 600}); } }));
        help.append(new nw.MenuItem({ label: 'Whitepaper', click: function() { gui.Window.open('https://medium.com/@musicoin/musicoin-project-white-paper-v2-0-6be5fd53191b',{position: 'center', width: 1000, height: 600}); } }));
        help.append(new nw.MenuItem({ label: 'FAQ', click: function() { gui.Window.open('https://www.musicoin.org/faq',{position: 'center', width: 1000, height: 600}); } }));
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'Mining Pools List', click: function() { gui.Window.open('https://github.com/Musicoin/go-musicoin/wiki/Mining-Pools',{position: 'center', width: 1000, height: 600}); } }));
      } else {
        help.append(new nw.MenuItem({ label: 'New GitHub Issue', click: function() { gui.Shell.openExternal('https://github.com/Musicoin/desktop/issues/new'); } })) ;
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'Discord', click: function() { gui.Shell.openExternal('https://discord.gg/gA8gjxC'); } }));
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'How It Works', click: function() { gui.Shell.openExternal('https://www.musicoin.org/how-it-works'); } }));
        help.append(new nw.MenuItem({ label: 'Whitepaper', click: function() { gui.Shell.openExternal('https://medium.com/@musicoin/musicoin-project-white-paper-v2-0-6be5fd53191b'); } }));
        help.append(new nw.MenuItem({ label: 'FAQ', click: function() { gui.Shell.openExternal('https://www.musicoin.org/faq'); } }));
        help.append(new nw.MenuItem({ type: 'separator' }));
        help.append(new nw.MenuItem({ label: 'Mining Pools List', click: function() { gui.Shell.openExternal('https://github.com/Musicoin/go-musicoin/wiki/Mining-Pools'); } }));
    }
    menu.append(new nw.MenuItem({label: 'Help', submenu: help }));
    nw.Window.get().menu = menu;

    document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById("defaultOpen").click();
    var quick = 1700;
    var minutes = 2;
    var interval = minutes * 60 * 1000;
    setInterval(function() {
      document.querySelector("msc-profile-view").activePeers();
    }, interval);
    setInterval(function() {
      document.querySelector("msc-profile-view").webviewDetectChange();
    }, quick);
    });

    ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
    //console.log("  System time  :" + new Date());
    //console.log("  Network time :" + date);
    var nDate = date.getTime();
    var sDate = new Date().getTime();

    if(err) {
        console.error(err);
        return;
    // Lazy check, detect only difference ~ 2 minutes
    } else if (nDate - sDate > 90000 || nDate - sDate < -90000) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "Please enable network time synchronisation in system settings. \n" +
        (date.toString()).slice(0, -18) + " UTC +0"};
      new Notification("System clock seems incorrect", alert);
    } else {}
    });

    function activeTabs(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    }
