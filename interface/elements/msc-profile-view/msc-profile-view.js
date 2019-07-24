var gui = require('nw.gui');
var fs = require('fs-extra');
var path = require('path');
var os = require('os');
var Finder = require('fs-finder');
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
      .to('version')
      .to('chainVersion');

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

  _computeIsSyncing: function() {
    return this.syncStatus && this.syncStatus.syncing;
  },

  _computeIsSyncingText: function() {
    return (this.syncStatus && this.syncStatus.syncing) ? document.querySelector("msc-introduction").echo('mainStatusJS_sync') + ((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2) + document.querySelector("msc-introduction").echo('mainStatusJS_sync_percent') : "";

  },

  _formatBlockNumber: function() {
    if (!this.syncStatus || !this.syncStatus.currentBlock) return "";
    return this.syncStatus.currentBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  _formatHighBlockNumber: function() {
    if (!this.syncStatus || !this.syncStatus.highestBlock) return "";
    return "/" + this.syncStatus.highestBlock.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  _computeTimeSinceLastBlockMessage: function() {
    if (!this.syncStatus || !this.syncStatus.mostRecentBlockTime) return "";
    return document.querySelector("msc-introduction").echo('mainStatusJS_last_block') + this._timeSince(this.syncStatus.mostRecentBlockTime);
  },

  formatNumber: function(number, decimals) {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  echo: function(phrase) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var settings = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\settings.js';
    } else if (platform.includes("win32")) {
      var settings = process.env.APPDATA + '\\Musicoin\\config\\settings.js';
    } else if (platform.includes("darwin")) {
      var settings = process.env.HOME + '/Library/Musicoin/config/settings.js';
    } else if (platform.includes("linux")) { //linux
      var settings = process.env.HOME + '/.musicoin/config/settings.js';
    }
    var locales = process.cwd() + '/interface/locales';
    lang = JSON.parse(fs.readFileSync(settings, 'utf-8'));
    var y18n = require('y18n')({
      updateFiles: false,
      directory: locales,
      locale: lang.locale,
      fallbackToLanguage: "en"
    });
    return y18n.__(phrase + "");
  },

  _timeSince: function(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    const intervals = [{
        value: 60,
        unit: "m"
      },
      {
        value: 60,
        unit: "h"
      },
      {
        value: 24,
        unit: "d"
      },
      {
        value: 30,
        unit: "mon"
      },
      {
        value: 12,
        unit: "yr"
      },
    ]
    let unit = "s";
    let value = seconds;
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      if (value > interval.value) {
        unit = interval.unit;
        value = value / interval.value;
      } else {
        break;
      }
    }

    const rounded = Math.round(value);
    return `${rounded}${unit}`;
  },

  handleNewAccount: function() {
    this.$.newAccountDialog.open();
  },

  handleAddPeer: function() {
    this.$.addPeerDialog.open();
  },

  backupWallet: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
    } else if (platform.includes("win32")) {
      var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore';
    } else if (platform.includes("darwin")) {
      var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore';
    } else if (platform.includes("linux")) { //linux
      var pathOfKey = process.env.HOME + '/.musicoin/keystore';
    }
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
      icon: iconPath,
      body: document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_1') +
        document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_2') + pathOfKey + document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_3')
    };
    new Notification(document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification'), alert);
    gui.Shell.showItemInFolder(pathOfKey);
  },

  showLogDir: function() {
    if (platform.includes("win32")) {
      var logsDir = process.env.APPDATA + '\\Musicoin\\wallet-ui\\logs';
    } else if (platform.includes("darwin")) {
      var logsDir = process.env.HOME + '/Library/Musicoin/wallet-ui/logs';
    } else if (platform.includes("linux")) { //linux
      var logsDir = process.env.HOME + '/.musicoin/wallet-ui/logs';
    }
    gui.Shell.showItemInFolder(logsDir);
  },

  wipeBlockChainDataAction: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var gmcSettingsFile = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("win32")) {
      var gmcSettingsFile = process.env.APPDATA + '\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("darwin")) {
      var gmcSettingsFile = process.env.HOME + '/Library/Musicoin/config/config.std.js';
    } else if (platform.includes("linux")) { //linux
      var gmcSettingsFile = process.env.HOME + '/.musicoin/config/config.std.js';
    }
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var DefaultBlockChainLocation = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\gmc';
    } else if (platform.includes("win32")) {
      var DefaultBlockChainLocation = process.env.APPDATA + '\\Musicoin\\gmc'
    } else if (platform.includes("darwin")) {
      var DefaultBlockChainLocation = process.env.HOME + '/Library/Musicoin/gmc';
    } else if (platform.includes("linux")) { //linux
      var DefaultBlockChainLocation = process.env.HOME + '/.musicoin/gmc';
    }
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var gmcDefaultLocation = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin';
    } else if (platform.includes("win32")) {
      var gmcDefaultLocation = process.env.APPDATA + '\\Musicoin'
    } else if (platform.includes("darwin")) {
      var gmcDefaultLocation = process.env.HOME + '/Library/Musicoin';
    } else if (platform.includes("linux")) { //linux
      var gmcDefaultLocation = process.env.HOME + '/.musicoin';
    }
    var gmcPid = fs.readFileSync(gmcDefaultLocation + '/config/gmc.pid');
    if (platform.includes("win32")) {
      var taskKill = require('child_process');
      taskKill.exec('taskkill /PID ' + String(gmcPid) + ' /T /F');
    } else {
      var killAll = require('child_process');
      killAll.exec('killall -15 gmc');
    }
    gmcSettings = require(gmcSettingsFile);
    args = gmcSettings.chain.args;
    args.forEach(function(a) {
      if (a.indexOf('--datadir=') > -1) document.getElementById('BlockChainData').textContent = a.slice(10)
    });
    if (document.getElementById('BlockChainData').textContent != "") {
      directoryToRemove = document.getElementById('BlockChainData').textContent;
    } else {
      directoryToRemove = DefaultBlockChainLocation;
    }
    fs.removeSync(directoryToRemove);
    alert(document.querySelector("msc-profile-view").echo('profileViewHtml_wipeBlockChain_finished') + "\n" + document.querySelector("msc-profile-view").echo('profileViewHtml_datadir_alert2'));
  },

  wipeBlockChainDataConfirmDialog: function() {
    this.$.wipeBlockChainDataDialogConfirm.open();
  },

  wipeBlockChainDataDialog: function() {
    this.$.wipeBlockChainDataDialog.open();
  },

  gmcOverwriteCache: function(size) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var gmcSettingsFile = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("win32")) {
      var gmcSettingsFile = process.env.APPDATA + '\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("darwin")) {
      var gmcSettingsFile = process.env.HOME + '/Library/Musicoin/config/config.std.js';
    } else if (platform.includes("linux")) { //linux
      var gmcSettingsFile = process.env.HOME + '/.musicoin/config/config.std.js';
    }
    gmcSettings = require(gmcSettingsFile);
    gmcSettings.chain.args.push('--cache=' + size);
    delete gmcSettings.chain.absolutePath;
    fs.writeFileSync(gmcSettingsFile, "module.exports = " + JSON.stringify(gmcSettings, null, 2));
  },

  gmcOverwriteCacheDialog: function() {
    this.$.gmcOverwriteCache.open();
  },

  importAny: function() {
    this.$.importAnyDialog.open();
  },

  copyAddress: function(e) {
    var account = e.model.account.address;
    var clipboard = gui.Clipboard.get();
    clipboard.set(account, 'text');
    alert("Copied wallet address: " + account);
  },

  addExistingAccount: function() {
    document.getElementById('fileDialog').click();
    document.querySelector('#fileDialog').addEventListener("change", function() {
      var filePath = this.value;
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\' + path.basename(filePath);
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
    var alert = {
      icon: iconPath,
      body: document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_alert_body')
    };
    if (this.syncStatus.initialSyncEnded == true) {
      this.getAccounts = mscIntf.accountModule.getAccounts();
      this.$.sendDialogMenu.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_Notification_1'), alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_Notification_2'), alert);
    } else {
      this.getAccounts = mscIntf.accountModule.getAccounts();
      this.$.sendDialogMenu.open();
    }
  },

  showSendDialogFromAccount: function() {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
      icon: iconPath,
      body: document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_alert_body')
    };
    if (this.syncStatus.initialSyncEnded == true) {
      this.$.senderAccount.value = document.getElementById('AccountDialog').textContent;
      this.$.sendDialogFromAccount.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_Notification_1'), alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_showSendDialog_Notification_2'), alert);
    } else {
      this.$.senderAccount.value = document.getElementById('AccountDialog').textContent;
      this.$.sendDialogFromAccount.open();
    }
  },

  backupAccount: function(e) {
    var account = e.model.account.address;
    document.getElementById('fileDialogBackup-' + account).click();
    document.querySelector('#fileDialogBackup-' + account).addEventListener("change", function() {
      var tmpPath = this.value;
      var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_1') +
          document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_2') + "\n" + tmpPath + document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_3')
      };
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
      pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
      var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
      fs.copySync(String(pathOfAccount), filePath);
      document.getElementById('fileDialogBackup-' + account).value = "";
      // Fires double notifications, when same account selected again
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_backupAccount_Notification') + tmpPath, alert);
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
        body: document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_1') +
          document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_2') + "\n" + tmpPath + document.querySelector("msc-profile-view").echo('profileJS_backupWallet_Notification_body_3')
      };
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
      pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
      var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
      fs.copySync(String(pathOfAccount), filePath);
      document.getElementById('fileDialogBackupAccount-' + account).value = "";
      // Fires double notifications, when same account selected again
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_backupAccount_Notification') + tmpPath, alert);
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
    } else if (platform.includes("win32")) {
      var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
    } else if (platform.includes("darwin")) {
      var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
    } else if (platform.includes("linux")) { //linux
      var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
    }
    var account = document.getElementById('AccountDialog').textContent;
    pathOfAccount = Finder.in(pathOfKey).findFiles(account.slice(2));
    QRCode.toDataURL((fs.readFileSync((String(pathOfAccount)), {
        encoding: 'utf-8'
      })), {
        errorCorrectionLevel: 'H'
      })
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
        body: document.querySelector("msc-profile-view").echo('profileJS_exportQRCode_body1') +
          document.querySelector("msc-profile-view").echo('profileJS_exportQRCode_body2')
      };
      var imgName = ('UTC--' + new Date().toISOString() + '--' + account).split(':').join('-');
      var base64Data = paperImage.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      var filePath = "";
      var filePath = tmpPath + '/' + imgName + '.png';
      fs.writeFileSync(filePath, base64Data, {
        encoding: 'base64'
      });
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_exportQRCode_Notification') + tmpPath, alert);
      document.getElementById('fileDialogPaper-' + account).value = "";
    });
    this.$.paperWalletDialog.close();
  },

  clearPaperWallet: function() {
    document.getElementById('paper-wallet').src = "";
  },

  webviewGetCookies: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var myCookies = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\myCookies';
    } else if (platform.includes("win32")) {
      var myCookies = process.env.APPDATA + '\\Musicoin\\myCookies';
    } else if (platform.includes("darwin")) {
      var myCookies = process.env.HOME + '/Library/Musicoin/myCookies';
    } else if (platform.includes("linux")) { //linux
      var myCookies = process.env.HOME + '/.musicoin/myCookies';
    }
    var webview = document.getElementById('mPlayer');
    nwin.cookies.getAll({
      url: "https://musicoin.org/",
      storeId: webview.getCookieStoreId(),
      name: "musicoin-session"
    }, cookies => fs.writeFile(myCookies, JSON.stringify(cookies, null, 4), 'utf-8'));
  },

  webviewSetCookies: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var myCookies = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\myCookies';
    } else if (platform.includes("win32")) {
      var myCookies = process.env.APPDATA + '\\Musicoin\\myCookies';
    } else if (platform.includes("darwin")) {
      var myCookies = process.env.HOME + '/Library/Musicoin/myCookies';
    } else if (platform.includes("linux")) { //linux
      var myCookies = process.env.HOME + '/.musicoin/myCookies';
    }
    var webview = document.getElementById('mPlayer');
    if (!fs.existsSync(myCookies)) {
      document.querySelector("msc-profile-view").webviewGetCookies();
    } else {
      var myCookiesObj = JSON.parse(fs.readFileSync(myCookies, 'utf-8'));
      nwin.cookies.set({
        "url": "https://musicoin.org",
        storeId: webview.getCookieStoreId(),
        "domain": ".musicoin.org",
        "expirationDate": myCookiesObj[0].expirationDate,
        "name": "musicoin-session",
        "sameSite": "no_restriction",
        "value": myCookiesObj[0].value
      });
    }
  },

  paperWalletImport: function() {
    this.$.paperWalletImportDialog.open();
    this.$.importAnyDialog.close();
  },

  decodeQRCode: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
    } else if (platform.includes("win32")) {
      var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
    } else if (platform.includes("darwin")) {
      var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
    } else if (platform.includes("linux")) { //linux
      var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
    }
    png = new(require('pngjs').PNG)();
    document.getElementById('fileDialogPaperImport').click();
    document.querySelector('#fileDialogPaperImport').addEventListener("change", function() {
      var PaperWallet = document.getElementById('fileDialogPaperImport').value;
      png.parse(fs.readFileSync(PaperWallet), function(err, decodedPng) {
        if (err) {
          alert(document.querySelector("msc-profile-view").echo('profileJS_decodeQRCode_alert'));
          //console.log(err);
        }
        var code = jsQR(decodedPng.data, decodedPng.width, decodedPng.height);
        var wallet = JSON.parse(code.data);
        var accountName = (new Date().toISOString() + '--' + wallet.address).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, code.data, 'utf-8');
        document.getElementById('fileDialogPaperImport').value = "";
      });
    });
    this.$.paperWalletImportDialog.close();
  },

  clearPaperWalletImport: function() {
    document.getElementById('fileDialogPaperImport').value = "";
  },

  showExplorerWindow: function(e) {
    gui.Window.open('https://explorer.musicoin.org/account/' + e.model.account.address, {
      position: 'center',
      width: 1000,
      height: 600
    });
  },

  showExplorerWindowFromDialog: function() {
    var account = document.getElementById('AccountDialog').textContent;
    gui.Window.open('https://explorer.musicoin.org/account/' + account, {
      position: 'center',
      width: 1000,
      height: 600
    });
  },

  maxWindow: function() {
    if (nwin.width > 1000) {
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
    webview.executeScript({
      code: "audio = document.getElementById('playerFrame').contentWindow.document.getElementsByTagName('audio'); for (var j = 0; j < audio.length; j++) {audio[j].muted = true;}"
    });
  },

  unmuteAudio: function() {
    document.getElementById('unmute').style.display = 'none';
    document.getElementById('mute').style.display = '';
    var webview = document.getElementById('mPlayer');
    webview.executeScript({
      code: "audio = document.getElementById('playerFrame').contentWindow.document.getElementsByTagName('audio'); for (var j = 0; j < audio.length; j++) {audio[j].muted = false;}"
    });
  },

  webviewDetectChange: function() {
    var webview = document.getElementById('mPlayer');
    webview.executeScript({
      code: "cover = document.getElementById('playerFrame').contentWindow.document.getElementById('player-badge-image'); trackCover = 'https://musicoin.org' + cover.getAttribute('src'); title = document.getElementById('playerFrame').contentWindow.document.getElementById('player-title').textContent; artist = document.getElementById('playerFrame').contentWindow.document.getElementById('player-artist').textContent; playTime = document.getElementById('playerFrame').contentWindow.document.getElementById('player-time-played').textContent; var alert = { icon: trackCover, body: artist }; if (playTime != '00:00' && playTime < '00:03') new Notification(title, alert);"
    });
  },

  showAccountDetails: function(e) {
    var account = e.model.account.address;
    this.userAccount = account;
    this.userBalance = document.getElementById(account).textContent;
    this.userImage = blockies.create({
      seed: account,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
    this.$.showAccountDetailsDialog.open();
  },

  approveSend: function() {
    account = document.getElementById('sender').value;
    recipient = document.getElementById('recipient').value;
    this.userAccount = account;
    this.recipientAccount = recipient;
    this.sendBalance = document.getElementById('coins').value + ' MUSIC';
    this.userImageFrom = blockies.create({
      seed: account,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
    this.userImageRecipient = blockies.create({
      seed: recipient,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
    this.$.approveSendDialog.open();
  },
  approveSendAccount: function() {
    account = document.getElementById('senderAccount').value;
    recipient = document.getElementById('recipientAccount').value;
    this.userAccount = account;
    this.recipientAccount = recipient;
    this.sendBalance = document.getElementById('coinsAccount').value + ' MUSIC';
    this.userImageFrom = blockies.create({
      seed: account,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
    this.userImageRecipient = blockies.create({
      seed: recipient,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
    this.$.approveSendDialogAccount.open();
  },

  addPeers: function(e) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfNodes = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
    } else if (platform.includes("win32")) {
      var pathOfNodes = process.env.APPDATA + '\\Musicoin\\bootnodes.json';
    } else if (platform.includes("darwin")) {
      var pathOfNodes = process.env.HOME + '/Library/Musicoin/bootnodes.json';
    } else if (platform.includes("linux")) { //linux
      var pathOfNodes = process.env.HOME + '/.musicoin/bootnodes.json';
    }
    var obj = JSON.parse(fs.readFileSync(pathOfNodes, 'utf-8'));
    var remoteNodes = [];
    for (var i = 0; i < obj['nodes'].length; i++) {
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
          .then(() => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_connecting') + array.length + document.querySelector("msc-profile-view").echo('profileJS_addPeers_peers_along'))
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_failed') + err);
      } else {
        mscIntf.accountModule.addPeers(remoteNodes)
          .then(() => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_default_list'))
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_failed_default_list') + err);
      }
      this.$.addPeerDialog.close();
      return;
    } else {
      this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_no_manual');
      mscIntf.accountModule.addPeers(remoteNodes)
        .then(() => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_default_list_loaded'))
        .delay(5000)
        .then(() => this.txStatus = "")
        .catch(err => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_addPeers_failed_default') + err);
      this.$.addPeerDialog.close();
      return;
    }
  },

  createNewAccount: function() {
    var v1 = this.$.newAccountPassword.value;
    var v2 = this.$.newAccountPasswordVerify.value;
    if (v1 == v2 && v1.length > 0 && zxcvbn(v1).score >= 2) {
      mscIntf.accountModule.createAccount(this.$.newAccountPassword.value)
        .then(account => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_created_account') + account)
        .catch(err => this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_failed') + err);
      this.clearNewAccountFields();
      this.$.newAccountDialog.close();
      this.$.createNewAccountDialog.close();
    } else if (v1 != v2) {
      this.clearNewAccountFields();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_match_failed'));
    } else if (v1 == v2 && v1.length == 0) {
      this.clearNewAccountFields();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_empty'));
    } else if (zxcvbn(v1).score < 2) {
      this.clearNewAccountFields();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_easy_password'));
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
    } else if (platform.includes("win32")) {
      var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\UTC--';
    } else if (platform.includes("darwin")) {
      var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/UTC--';
    } else if (platform.includes("linux")) { //linux
      var pathOfKey = process.env.HOME + '/.musicoin/keystore/UTC--';
    }
    var privateKey = (document.getElementById('dummyKey').value).replace(/\s+/g, '');
    var password = document.getElementById('dummyPassword').value;
    if (password.length > 0 && zxcvbn(password).score >= 2 && privateKey.includes("0x") && privateKey.length <= 66 && privateKey.length >= 62 && privateKey != password) {
      var wallet = new ethers.Wallet(privateKey);
      wallet.encrypt(password, {
        scrypt: {
          N: 262144
        }
      }).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
        accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, finalAccount, 'utf-8');
      });
      this.clearKeyFromPrivateKey();
      this.$.importAnyDialog.close();
    } else if (password.length > 0 && zxcvbn(password).score >= 2 && privateKey.length <= 64 && privateKey.length >= 60 && privateKey != password) {
      var wallet = new ethers.Wallet("0x" + privateKey);
      wallet.encrypt(password).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
        accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, finalAccount, 'utf-8');
      });
      this.clearKeyFromPrivateKey();
      this.$.importAnyDialog.close();
    } else if (password.length = 0) {
      this.clearKeyFromPrivateKey();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_empty'));
    } else if (zxcvbn(password).score < 2) {
      this.clearKeyFromPrivateKey();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_easy_password'));
    } else if (privateKey = password) {
      this.clearKeyFromPrivateKey();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createKeyFromPrivateKeyAction_same_password'));
    } else if (privateKey.length < 62) {
      this.clearKeyFromPrivateKey();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createKeyFromPrivateKeyAction_incorrect_private_key'));
    } else {
      this.clearKeyFromPrivateKey();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createKeyFromPrivateKeyAction_incorrect_private_key'));
    }
  },

  createKeyFromMnemonic: function() {
    this.$.createKeyFromMnemonic.open();
  },

  createKeyFromMnemonicAction: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
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
      wallet.encrypt(password, {
        scrypt: {
          N: 262144
        }
      }).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
        accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, finalAccount, 'utf-8');
      });
      this.clearKeyFromMnemonic();
      this.$.importAnyDialog.close();
    } else if (password.length = 0) {
      this.clearKeyFromMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_empty'));
    } else if (password.length > 64) {
      this.clearKeyFromMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createKeyFromMnemonicAction_64_bytes'));
    } else if (zxcvbn(password).score < 2) {
      this.clearKeyFromMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_easy_password'));
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\UTC--';
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
      body: document.querySelector("msc-profile-view").echo('profileJS_createNewMnemonicAccount_body')
    };
    var password1 = document.getElementById('newAccountPasswordMnemonic').value;
    var password2 = document.getElementById('newAccountPasswordMnemonicVerify').value;
    if (password1 == password2 && password1.length > 0 && password1.length < 65 && zxcvbn(password1).score >= 2) {
      // It's important to show Notification before mnemonic generation, otherwise we would see alert first
      new Notification(document.querySelector("msc-profile-view").echo('profileJS_createNewMnemonicAccount_Notification'), mnemonicNotification);
      var mnemonic = ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
      var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
      wallet.encrypt(password1, {
        scrypt: {
          N: 262144
        }
      }).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
        // finalAccountTmp["x-ethers"].gethFilename works only vs mnemonic creation, so kinda useless
        accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, finalAccount, 'utf-8');
        alert(mnemonic);
      });
      this.clearNewAccountFieldsMnemonic();
      this.$.newMnemonicAccountDialog.close();
      this.$.createNewAccountDialog.close();
    } else if (password1 != password2) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_match_failed'));
    } else if (password1 == password2 && password1.length == 0) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_password_empty'));
    } else if (password1 == password2 && password1.length > 64) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createKeyFromMnemonicAction_64_bytes'));
    } else if (password1 == password2 && zxcvbn(password1).score < 2) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-profile-view").echo('profileJS_createNewAccount_easy_password'));
    } else {
      this.clearNewAccountFieldsMnemonic();
      return false;
    }
  },


  approveRemoveAccount: function() {
    var account = document.getElementById('AccountDialog').textContent;
    document.getElementById('sourceAccountRemove').value = account;
    this.userBalance = document.getElementById(account).textContent;
    this.userImage = blockies.create({
      seed: account,
      size: 8,
      scale: 16,
      color: '#f2c455',
      bgcolor: '#fff'
    }).toDataURL();
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
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
      if (wallet.address = account) fs.unlinkSync((String(pathOfAccount)));
    }).catch(function(err) {
      alert(err);
    });
    document.getElementById('sourceAccountRemove').value = "";
    document.getElementById('removePassword').value = "";
    this.$.showAccountDetailsDialog.close();
  },

  getMarketValue: function() {
    var CoinMarketCapUrl = "https://api.coinmarketcap.com/v1/ticker/musicoin/?limit=1";
    rp({
        url: CoinMarketCapUrl,
        json: true
      })
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(usd => this.musicUsd = usd[0].price_usd)
      .catch(error => this.musicUsd = document.querySelector("msc-profile-view").echo('profileJS_getMarketValue_failed'));
    rp({
        url: CoinMarketCapUrl,
        json: true
      })
      .then(result => JSON.parse(JSON.stringify(result)))
      .then(btc => this.musicBtc = btc[0].price_btc)
      .catch(error => this.musicBtc = document.querySelector("msc-profile-view").echo('profileJS_getMarketValue_failed'));
  },
  marketRates: function() {
    document.querySelector("msc-profile-view").getMarketValue();
    this.$.marketRatesDialog.open();
  },
  displayBalanceInBtc: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i = 0; i < accountMusic.length; i += 1) {
      accountMusic[i].style.display = 'none';
    }
    for (var i = 0; i < accountUsd.length; i += 1) {
      accountUsd[i].style.display = 'none';
    }
    for (var i = 0; i < accountBtc.length; i += 1) {
      accountBtc[i].style.display = '';
    }
  },
  displayBalanceInUsd: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i = 0; i < accountMusic.length; i += 1) {
      accountMusic[i].style.display = 'none';
    }
    for (var i = 0; i < accountBtc.length; i += 1) {
      accountBtc[i].style.display = 'none';
    }
    for (var i = 0; i < accountUsd.length; i += 1) {
      accountUsd[i].style.display = '';
    }
  },

  displayBalanceInMusic: function() {
    var accountMusic = document.getElementsByClassName('account-music');
    var accountBtc = document.getElementsByClassName('account-btc');
    var accountUsd = document.getElementsByClassName('account-usd');
    for (var i = 0; i < accountBtc.length; i += 1) {
      accountBtc[i].style.display = 'none';
    }
    for (var i = 0; i < accountUsd.length; i += 1) {
      accountUsd[i].style.display = 'none';
    }
    for (var i = 0; i < accountMusic.length; i += 1) {
      accountMusic[i].style.display = '';
    }
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
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
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
        alert(wallet.signMessage(msg));
      });
      this.clearSignMsg();
      this.$.signMsgDialog.close();
    } else {
      alert(document.querySelector("msc-profile-view").echo('profileJS_signMsgAction_empty_msg'));
      return false;
    }
  },

  signMsgActionMenu: function() {
    var account = document.getElementById('signMsgAccountMenu').value;
    var password = document.getElementById('signPasswordMenu').value;
    var msg = document.getElementById('signMsgMenu').value;
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
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
        alert(wallet.signMessage(msg));
      });
      this.clearSignMsgMenu();
      this.$.signMsgDialogFromMenu.close();
    } else {
      alert(document.querySelector("msc-profile-view").echo('profileJS_signMsgAction_empty_msg'));
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
        alert(document.querySelector("msc-profile-view").echo('profileJS_verifyMsgAction_correct') + address);
        this.clearVerifyMsg();
        this.$.verifyMsgDialog.close();
      } else {
        alert(document.querySelector("msc-profile-view").echo('profileJS_verifyMsgAction_invalid'));
      }
    } else if (msgToVerify.length == 0) {
      alert(document.querySelector("msc-profile-view").echo('profileJS_verifyMsgAction_empty_msg'));
    } else if (account.length < 38) {
      document.getElementById('accountVerify').value = "";
      alert(document.querySelector("msc-profile-view").echo('profileJS_verifyMsgAction_invalid_account'));
    } else {
      this.clearVerifyMsg();
      alert(document.querySelector("msc-profile-view").echo('profileJS_verifyMsgAction_incorrect details'));
      return false;
    }
  },

  changeDataDirDialog: function() {
    this.$.changeDataDirDialog.open();
  },

  changeDataDir: function() {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var gmcSettingsFile = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("win32")) {
      var gmcSettingsFile = process.env.APPDATA + '\\Musicoin\\config\\config.std.js';
    } else if (platform.includes("darwin")) {
      var gmcSettingsFile = process.env.HOME + '/Library/Musicoin/config/config.std.js';
    } else if (platform.includes("linux")) { //linux
      var gmcSettingsFile = process.env.HOME + '/.musicoin/config/config.std.js';
    }
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var pathOfKey = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
    } else if (platform.includes("win32")) {
      var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
    } else if (platform.includes("darwin")) {
      var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
    } else if (platform.includes("linux")) { //linux
      var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
    }
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var gmcDefaultLocation = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin';
    } else if (platform.includes("win32")) {
      var gmcDefaultLocation = process.env.APPDATA + '\\Musicoin'
    } else if (platform.includes("darwin")) {
      var gmcDefaultLocation = process.env.HOME + '/Library/Musicoin';
    } else if (platform.includes("linux")) { //linux
      var gmcDefaultLocation = process.env.HOME + '/.musicoin';
    }
    var gmcPid = fs.readFileSync(gmcDefaultLocation + '/config/gmc.pid');
    document.getElementById('fileDialogDataDir').click();
    document.querySelector('#fileDialogDataDir').addEventListener("change", function() {
      gmcSettings = require(gmcSettingsFile);
      var filePath = document.getElementById('fileDialogDataDir').value + '/gmc';
      if (platform.includes("win32")) {
        var taskKill = require('child_process');
        taskKill.exec('taskkill /PID ' + String(gmcPid) + ' /T /F');
      } else {
        var killAll = require('child_process');
        killAll.exec('killall -15 gmc');
      }
      gmcSettings.chain.args = gmcSettings.chain.args.filter(function(e) {
        return e !== '--keystore=' + pathOfKey
      });
      args = gmcSettings.chain.args;
      var dataDirOldLocation = gmcDefaultLocation;
      args.forEach(function(a) {
        if (a.indexOf('--datadir=') > -1) document.getElementById('oldDataDir').textContent = a.slice(10)
      });
      delete gmcSettings.chain.absolutePath;
      if (document.getElementById('oldDataDir').textContent != "") dataDirOldLocation = document.getElementById('oldDataDir').textContent;
      gmcSettings.chain.args = gmcSettings.chain.args.filter(function(e) {
        return e !== '--datadir=' + dataDirOldLocation
      });
      gmcSettings.chain.args.push('--datadir=' + filePath);
      gmcSettings.chain.args.push('--keystore=' + pathOfKey);
      fs.moveSync(dataDirOldLocation + '/gmc', filePath);
      fs.writeFileSync(gmcSettingsFile, "module.exports = " + JSON.stringify(gmcSettings, null, 2));
      alert(document.querySelector("msc-profile-view").echo('profileViewHtml_datadir_alert1') + filePath + "\n" + document.querySelector("msc-profile-view").echo('profileViewHtml_datadir_alert2'));
      document.getElementById('fileDialogDataDir').value = "";
      document.getElementById('oldDataDir').textContent = "";
      this.$.changeDataDirDialog.close();
    });
  },

  sendCoins: function() {
    mscIntf.accountModule.sendCoins(
        document.getElementById('recipient').value,
        document.getElementById('coins').value,
        document.getElementById('sender').value,
        document.getElementById('sendPassword').value
      ).then((tx) => {
        var iconPath = 'file://' + nw.__dirname + '/favicon.png';
        var alert = {
          icon: iconPath,
          body: tx
        };
        new Notification(document.querySelector("msc-profile-view").echo('profileJS_sendCoins_Notification_body_1'), alert);
        this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_sendCoins_Notification_body_1') + "\n" + "txid:" + "\n" + tx;
      })
      .catch((err) => {
        this.txStatus = "Failed to send: " + err;
      });
    this.clearSendFields();
  },

  sendCoinsFromAccount: function() {
    mscIntf.accountModule.sendCoins(
        document.getElementById('recipientAccount').value,
        document.getElementById('coinsAccount').value,
        document.getElementById('senderAccount').value,
        document.getElementById('sendPasswordAccount').value
      ).then((tx) => {
        var iconPath = 'file://' + nw.__dirname + '/favicon.png';
        var alert = {
          icon: iconPath,
          body: tx
        };
        new Notification(document.querySelector("msc-profile-view").echo('profileJS_sendCoins_Notification_body_1'), alert);
        this.txStatus = document.querySelector("msc-profile-view").echo('profileJS_sendCoins_Notification_body_1') + "\n" + "txid:" + "\n" + tx;
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

  echo: function(phrase) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var settings = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\settings.js';
    } else if (platform.includes("win32")) {
      var settings = process.env.APPDATA + '\\Musicoin\\config\\settings.js';
    } else if (platform.includes("darwin")) {
      var settings = process.env.HOME + '/Library/Musicoin/config/settings.js';
    } else if (platform.includes("linux")) { //linux
      var settings = process.env.HOME + '/.musicoin/config/settings.js';
    }
    var locales = process.cwd() + '/interface/locales';
    lang = JSON.parse(fs.readFileSync(settings, 'utf-8'));
    var y18n = require('y18n')({
      updateFiles: false,
      directory: locales,
      locale: lang.locale,
      fallbackToLanguage: "en"
    });
    return y18n.__(phrase + "");
  },

  changeLanguage: function(locale) {
    if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
      var settings = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\settings.js';
    } else if (platform.includes("win32")) {
      var settings = process.env.APPDATA + '\\Musicoin\\config\\settings.js';
    } else if (platform.includes("darwin")) {
      var settings = process.env.HOME + '/Library/Musicoin/config/settings.js';
    } else if (platform.includes("linux")) { //linux
      var settings = process.env.HOME + '/.musicoin/config/settings.js';
    }
    lang = JSON.parse(fs.readFileSync(settings, 'utf-8'));
    lang.locale = locale;
    fs.writeFileSync(settings, JSON.stringify(lang, null, 2));
    nwin.reloadIgnoringCache();
  },

  spanishLang: function() {
    this.$.spanishLangDialog.open();
  },

  chineseLang: function() {
    this.$.chineseLangDialog.open();
  },

  patchOverlay: function(e) {
    // hack from: https://stackoverflow.com/a/31510980
    if (e.target.withBackdrop) {
      e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
    }
  }
});

var menu = new nw.Menu({
  type: 'menubar'
});

if (platform.includes("darwin")) {
  menu.createMacBuiltin('Musicoin', {
    hideEdit: false,
    hideWindow: true
  });
} else {}

var account = new nw.Menu();

let lAccount = echo('profileJS_menu_label_Account');
let lExplorer = echo('profileJS_menu_label_Explorer');
let lMarkets = echo('profileJS_menu_label_Markets');
let lOfficial = echo('profileJS_menu_label_Official');
let lAdvanced = echo('profileJS_menu_label_Advanced');
let lHelp = echo('profileJS_menu_label_Help');
let newAccount = echo('profileJS_menu_New_Account');
let importAccount = echo('profileJS_menu_Import_Account');
let sendFunds = echo('profileJS_menu_Send_Funds');
let sign = echo('profileJS_menu_Sign');
let verifyMessage = echo('profileJS_menu_Verify_Message');
let openKeystore = echo('profileJS_menu_Open_Keystore');
let quit = echo('profileJS_menu_Quit');
let mExplorer = echo('profileJS_menu_Explorer');
let coinMarketCapCharts = echo('profileJS_menu_CoinMarketCap_Charts');
let addPeers = echo('profileJS_menu_Add_Peers');
let gmcCache = echo('profileJS_menu_Select_Gmc_cache');
let gitHubIssue = echo('profileJS_menu_GitHub_Issue');
let howItworks = echo('profileJS_menu_How_It_Works');
let whitepaper = echo('profileJS_menu_Whitepaper');
let faq = echo('profileJS_menu_FAQ');
let mPools = echo('profileJS_menu_Mining_Pools');
let enLang = echo('profileJS_menu_Lang_Eng');
let ruLang = echo('profileJS_menu_Lang_Ru');
let esLang = echo('profileJS_menu_Lang_Es');
let changeDataDir = echo('profileJS_menu_DataDir');
let showLogDirectory = echo('profileJS_menu_logDir');
let removeGmcFolder = echo('profileJS_menu_removeGmcFolder');
let cnLang = echo('profileJS_menu_Lang_Cn');
let frLang = echo('profileJS_menu_Lang_Fr');
let nlLang = echo('profileJS_menu_Lang_Nl');
let ptLang = echo('profileJS_menu_Lang_Pt');
let trLang = echo('profileJS_menu_Lang_Tr');
let grLang = echo('profileJS_menu_Lang_Gr');


account.append(new nw.MenuItem({
  label: newAccount,
  key: 'n',
  modifiers: 'ctrl',
  click: function() {
    document.querySelector("msc-profile-view").createNewAccountDialog();
  }
}));
account.append(new nw.MenuItem({
  label: importAccount,
  key: 'i',
  modifiers: 'ctrl',
  click: function() {
    document.querySelector("msc-profile-view").importAny();
  }
}));
account.append(new nw.MenuItem({
  type: 'separator'
}));
account.append(new nw.MenuItem({
  label: sendFunds,
  key: 's',
  modifiers: 'ctrl',
  click: function() {
    document.querySelector("msc-profile-view").showSendDialog();
  }
}));
account.append(new nw.MenuItem({
  type: 'separator'
}));
account.append(new nw.MenuItem({
  label: sign,
  key: 's',
  modifiers: 'ctrl+cmd',
  click: function() {
    document.querySelector("msc-profile-view").signMsgFromMenu();
  }
}));
account.append(new nw.MenuItem({
  label: verifyMessage,
  key: 'v',
  modifiers: 'ctrl+cmd',
  click: function() {
    document.querySelector("msc-profile-view").verifyMsg();
  }
}));
account.append(new nw.MenuItem({
  type: 'separator'
}));
account.append(new nw.MenuItem({
  label: openKeystore,
  key: 'b',
  modifiers: 'ctrl',
  click: function() {
    document.querySelector("msc-profile-view").backupWallet();
  }
}));
account.append(new nw.MenuItem({
  type: 'separator'
}));
account.append(new nw.MenuItem({
  label: quit,
  key: 'q',
  modifiers: 'ctrl',
  click: function() {
    require('process').exit(0);
  }
}));
menu.append(new nw.MenuItem({
  label: lAccount,
  submenu: account
}));


var explorer = new nw.Menu();
explorer.append(new nw.MenuItem({
  label: mExplorer,
  key: 'e',
  modifiers: 'ctrl',
  click: function() {
    gui.Window.open('https://explorer.musicoin.org/', {
      position: 'center',
      width: 1000,
      height: 600
    });
  }
}));
menu.append(new nw.MenuItem({
  label: lExplorer,
  submenu: explorer
}));


var markets = new nw.Menu();
markets.append(new nw.MenuItem({
  label: coinMarketCapCharts,
  key: 'm',
  modifiers: 'ctrl+cmd',
  click: function() {
    gui.Window.open('https://coinmarketcap.com/currencies/musicoin/#charts', {
      position: 'center',
      width: 1000,
      height: 600
    });
  }
}));
markets.append(new nw.MenuItem({
  type: 'separator'
}));
if (platform.includes("darwin")) {
  markets.append(new nw.MenuItem({
    label: 'Dove Wallet: MUSIC/BTC',
    click: function() {
      gui.Window.open('https://dovewallet.com/trade/spot/music-btc', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  markets.append(new nw.MenuItem({
    label: 'Exchange Assets: MUSIC/BTC',
    click: function() {
      gui.Window.open('https://exchange-assets.com/en/?market=music_btc', {
        position: 'center',
        width: 1000,
        height: 600
      });      
    }
  }));
} else {
  markets.append(new nw.MenuItem({
    label: 'Dove Wallet: MUSIC/BTC',
    click: function() {
      gui.Shell.openExternal('https://dovewallet.com/trade/spot/music-btc');
    }
   })); 
  markets.append(new nw.MenuItem({
    label: 'Exchange Assets: MUSIC/BTC',
    click: function() {
      gui.Shell.openExternal('https://exchange-assets.com/en/?market=music_btc');
    }                                 
  }));
}
menu.append(new nw.MenuItem({
  label: lMarkets,
  submenu: markets
}));


var official = new nw.Menu();
official.append(new nw.MenuItem({
  label: 'Musicoin',
  key: 'm',
  modifiers: 'ctrl',
  click: function() {
    gui.Window.open('https://www.musicoin.org/', {
      position: 'center',
      width: 1000,
      height: 600
    });
  }
}));
official.append(new nw.MenuItem({
  type: 'separator'
}));
official.append(new nw.MenuItem({
  label: 'Bitcointalk: Musicoin',
  key: 'f',
  modifiers: 'ctrl+cmd',
  click: function() {
    gui.Window.open('https://bitcointalk.org/index.php?topic=1776113.0', {
      position: 'center',
      width: 1000,
      height: 600
    });
  }
}));
official.append(new nw.MenuItem({
  type: 'separator'
}));

if (platform.includes("darwin")) {
  official.append(new nw.MenuItem({
    label: 'Medium',
    click: function() {
      gui.Window.open('https://medium.com/@musicoin', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Twitter',
    click: function() {
      gui.Window.open('https://twitter.com/musicoins', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Instagram',
    click: function() {
      gui.Window.open('https://www.instagram.com/musicoinofficial/', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Facebook',
    click: function() {
      gui.Window.open('https://www.facebook.com/lovemusicoin', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Discord',
    click: function() {
      gui.Window.open('https://discord.gg/gA8gjxC', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
} else {
  official.append(new nw.MenuItem({
    label: 'Medium',
    click: function() {
      gui.Shell.openExternal('https://medium.com/@musicoin');
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Twitter',
    click: function() {
      gui.Shell.openExternal('https://twitter.com/musicoins');
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Instagram',
    click: function() {
      gui.Shell.openExternal('https://www.instagram.com/musicoinofficial/');
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Facebook',
    click: function() {
      gui.Shell.openExternal('https://www.facebook.com/lovemusicoin');
    }
  }));
  official.append(new nw.MenuItem({
    label: 'Discord',
    click: function() {
      gui.Shell.openExternal('https://discord.gg/gA8gjxC');
    }
  }));
}

official.append(new nw.MenuItem({
  type: 'separator'
}));
official.append(new nw.MenuItem({
  label: 'GitHub',
  key: 'g',
  modifiers: 'ctrl',
  click: function() {
    gui.Window.open('https://github.com/Musicoin', {
      position: 'center',
      width: 1000,
      height: 600
    });
  }
}));

menu.append(new nw.MenuItem({
  label: lOfficial,
  submenu: official
}));

var advanced = new nw.Menu();
advanced.append(new nw.MenuItem({
  label: enLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("en");
  }
}));
advanced.append(new nw.MenuItem({
  label: ruLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("ru");
  }
}));
advanced.append(new nw.MenuItem({
  label: esLang,
  click: function() {
    document.querySelector("msc-profile-view").spanishLang();
  }
}));
advanced.append(new nw.MenuItem({
  label: cnLang,
  click: function() {
    document.querySelector("msc-profile-view").chineseLang();
  }
}));
advanced.append(new nw.MenuItem({
  label: frLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("fr");
  }
}));
advanced.append(new nw.MenuItem({
  label: nlLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("nl");
  }
}));
advanced.append(new nw.MenuItem({
  label: ptLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("pt");
  }
}));
advanced.append(new nw.MenuItem({
  label: trLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("tr");
  }
}));
advanced.append(new nw.MenuItem({
  label: grLang,
  click: function() {
    document.querySelector("msc-profile-view").changeLanguage("gr");
  }
}));

advanced.append(new nw.MenuItem({
  type: 'separator'
}));
advanced.append(new nw.MenuItem({
  label: addPeers,
  key: 'p',
  modifiers: 'ctrl',
  click: function() {
    document.querySelector("msc-profile-view").handleAddPeer();
  }
}));
advanced.append(new nw.MenuItem({
  type: 'separator'
}));
advanced.append(new nw.MenuItem({
  label: changeDataDir,
  click: function() {
    document.querySelector("msc-profile-view").changeDataDirDialog();
  }
}));
advanced.append(new nw.MenuItem({
  label: removeGmcFolder,
  click: function() {
    document.querySelector("msc-profile-view").wipeBlockChainDataDialog();
  }
}));
advanced.append(new nw.MenuItem({
  type: 'separator'
}));
advanced.append(new nw.MenuItem({
  label: gmcCache,
  click: function() {
    document.querySelector("msc-profile-view").gmcOverwriteCacheDialog();
  }
}));
advanced.append(new nw.MenuItem({
  label: showLogDirectory,
  click: function() {
    document.querySelector("msc-profile-view").showLogDir();
  }
}));

menu.append(new nw.MenuItem({
  label: lAdvanced,
  submenu: advanced
}));
var help = new nw.Menu();

if (platform.includes("darwin")) {
  help.append(new nw.MenuItem({
    label: gitHubIssue,
    click: function() {
      gui.Window.open('https://github.com/Musicoin/desktop/issues/new', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: 'Discord',
    click: function() {
      gui.Window.open('https://discord.gg/gA8gjxC', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: howItworks,
    click: function() {
      gui.Window.open('https://www.musicoin.org/how-it-works', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  help.append(new nw.MenuItem({
    label: whitepaper,
    click: function() {
      gui.Window.open('https://medium.com/@musicoin/musicoin-project-white-paper-v2-0-6be5fd53191b', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  help.append(new nw.MenuItem({
    label: faq,
    click: function() {
      gui.Window.open('https://www.musicoin.org/faq', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: mPools,
    click: function() {
      gui.Window.open('https://github.com/Musicoin/go-musicoin/wiki/Mining-Pools', {
        position: 'center',
        width: 1000,
        height: 600
      });
    }
  }));
} else {
  help.append(new nw.MenuItem({
    label: gitHubIssue,
    click: function() {
      gui.Shell.openExternal('https://github.com/Musicoin/desktop/issues/new');
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: 'Discord',
    click: function() {
      gui.Shell.openExternal('https://discord.gg/gA8gjxC');
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: howItworks,
    click: function() {
      gui.Shell.openExternal('https://www.musicoin.org/how-it-works');
    }
  }));
  help.append(new nw.MenuItem({
    label: whitepaper,
    click: function() {
      gui.Shell.openExternal('https://medium.com/@musicoin/musicoin-project-white-paper-v2-0-6be5fd53191b');
    }
  }));
  help.append(new nw.MenuItem({
    label: faq,
    click: function() {
      gui.Shell.openExternal('https://www.musicoin.org/faq');
    }
  }));
  help.append(new nw.MenuItem({
    type: 'separator'
  }));
  help.append(new nw.MenuItem({
    label: mPools,
    click: function() {
      gui.Shell.openExternal('https://github.com/Musicoin/go-musicoin/wiki/Mining-Pools');
    }
  }));
}

menu.append(new nw.MenuItem({
  label: lHelp,
  submenu: help
}));
nw.Window.get().menu = menu;

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("defaultOpen").click();
  document.querySelector("msc-profile-view").webviewSetCookies();

  var quick = 1700;
  setInterval(function() {
    document.querySelector("msc-profile-view").webviewDetectChange();
  }, quick);
});

ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
  //console.log("  System time  :" + new Date());
  //console.log("  Network time :" + date);
  var nDate = date.getTime();
  var sDate = new Date().getTime();

  if (err) {
    console.error(err);
    return;
    // Lazy check, detect only difference ~ 2 minutes
  } else if (nDate - sDate > 90000 || nDate - sDate < -90000) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
      icon: iconPath,
      body: echo('profileJS_ntpClient_turn_sync') +
        (date.toString()).slice(0, -18) + " UTC +0"
    };
    new Notification(echo('profileJS_ntpClient_Notification'), alert);
  } else {}
});

function toggleNavbar() {
  $("#navcool").toggleClass('hidden');
  $("#navcool1").toggleClass('hidden');
}

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

function activeTabsSpecial() {
  activeTabs(event, 'pMusic');
  document.querySelector("msc-profile-view").webviewSetCookies();
  document.querySelector("msc-profile-view").webviewGetCookies();
  var webview = document.getElementById('mPlayer');
  webview.reload();
}

function echo(phrase) {
  if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
    var settings = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\config\\settings.js';
  } else if (platform.includes("win32")) {
    var settings = process.env.APPDATA + '\\Musicoin\\config\\settings.js';
  } else if (platform.includes("darwin")) {
    var settings = process.env.HOME + '/Library/Musicoin/config/settings.js';
  } else if (platform.includes("linux")) { //linux
    var settings = process.env.HOME + '/.musicoin/config/settings.js';
  }
  var locales = process.cwd() + '/interface/locales';
  lang = JSON.parse(fs.readFileSync(settings, 'utf-8'));
  var y18n = require('y18n')({
    updateFiles: false,
    directory: locales,
    locale: lang.locale,
    fallbackToLanguage: "en"
  });
  return y18n.__(phrase + "");
}

function DropDown(el) {
  this.dd = el;
  this.placeholder = this.dd.children('span');
  this.opts = this.dd.find('ul.dropdown > li');
  this.val = '';
  this.index = -1;
  this.initEvents();
}

DropDown.prototype = {
  initEvents: function() {
    var obj = this;
    obj.dd.on('click', function(event) {
      $(this).toggleClass('active');
      return false;
    });
    obj.opts.on('click', function() {
      var opt = $(this);
      obj.val = opt.html();
      obj.index = opt.index();
      obj.placeholder.html(obj.val);
    });
  },
  getValue: function() {
    return this.val;
  },
  getIndex: function() {
    return this.index;
  }
}

function DropDown2(el) {
  this.dd = el;
  this.placeholder = this.dd.children('span');
  this.opts = this.dd.find('ul.dropdown > li');
  this.val = '';
  this.index = -1;
  this.initEvents();
}

DropDown2.prototype = {
  initEvents: function() {
    var obj = this;
    obj.dd.on('click', function(event) {
      $(this).toggleClass('active');
      return false;
    });
  },
  getValue: function() {
    return this.val;
  },
  getIndex: function() {
    return this.index;
  }
}

$(function() {
  var dd1 = new DropDown($('#bal_in_sel'));
  //TODO:run this _after_ accounts are loaded and drawn into the UI, properly,
  setTimeout(function() {
    var dds = new DropDown2($('.wrapper-dropdown'));
  }, 1000);
  //end TODO
  $(document).click(function() {
    $('.wrapper-dropdown').removeClass('active');
    $('#bal_in_sel').removeClass('active');
  });
});
