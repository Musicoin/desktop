var gui = require('nw.gui');
var fs = require('fs');
var path = require('path');
var os = require('os');
var username1 = require('username');
var copyFile = require('quickly-copy-file');
var Finder = require('fs-finder');
var jayson = require('jayson');
var _ = require('lodash');
var ntpClient = require('ntp-client');
var platform = os.platform();
var CoinMarketCap = require('coinmarketcap-api');
var market = new CoinMarketCap();
Polymer({
  is: 'msc-profile-view',
  properties: {
    accounts: Array,
    username: String,
    userImage: String,
    locale: Object,
    txStatus: String,
    musicUsd: String,
    musicBtc: String,
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
    username1().then(username1 => {
      if (platform.includes("win32")) {
        var pathOfKey = 'C:\\Users\\' + username1 + '\\AppData\\Roaming\\Musicoin\\keystore';
      } else if (platform.includes("darwin")) {
        var pathOfKey = '/Users/' + username1 + '/Library/Musicoin/keystore';
      } else if (platform.includes("linux")){  //linux
        var pathOfKey = '/home/' + username1 + '/.musicoin/keystore';
      }
      var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "You need to KNOW password for every account to unlock it." +
        " You can locate your accounts in: " + pathOfKey + " directory."};
      new Notification("Please backup your accounts in a safe place", alert);
      gui.Shell.showItemInFolder(pathOfKey);
    });
  },
  gmcOverwriteCache: function(size) {
      if (platform.includes("win32")) {
        var defaultCache = nw.__dirname + '\\config\\config.std.js';
        var newCache =  nw.__dirname + '\\config\\' + 'config.' + size + '.js';
      } else if (platform.includes("darwin")) {
        var defaultCache = nw.__dirname + '/config/config.std.js';
        var newCache =  nw.__dirname + '/config/' + 'config.' + size + '.js';
      } else if (platform.includes("linux")) { //linux
        var defaultCache = nw.__dirname + '/config/config.std.js';
        var newCache =  nw.__dirname + '/config/' + 'config.' + size + '.js';
      }
      
    copyFile(newCache, defaultCache, function(error) {
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
  addExistingAccount: function() {
    document.getElementById('fileDialog').click();
    document.querySelector('#fileDialog').addEventListener("change", function() {
    var filePath = this.value;
    username1().then(username1 => {
      if (platform.includes("win32")) {
        var pathOfKey = 'C:\\Users\\' + username1 + '\\AppData\\Roaming\\Musicoin\\keystore\\' + path.basename(filePath);
      } else if (platform.includes("darwin")) {
        var pathOfKey = '/Users/' + username1 + '/Library/Musicoin/keystore/' + path.basename(filePath);
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = '/home/' + username1 + '/.musicoin/keystore/' + path.basename(filePath);
      }
    copyFile(filePath, pathOfKey, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
    });
  });
  },
  showSendDialog: function(e) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {icon: iconPath, body: "Send function locked until wallet is in sync."};
    if (this.syncStatus.initialSyncEnded == true) {
      this.$.sender.value = e.model.dataHost.dataHost.account.address;
      this.$.sendDialog.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification("Send function locked", alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification("Gmc not started synchronization yet", alert);
    } else {
      this.$.sender.value = e.model.dataHost.dataHost.account.address;
      this.$.sendDialog.open();
    }
  },
  showSendDialogFromMenu: function() {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {icon: iconPath, body: "Send function locked until wallet is in sync."};
    if (this.syncStatus.initialSyncEnded == true) {
      this.$.sendDialogMenu.open();
    } else if ((((100 * (this.syncStatus.currentBlock)) / (this.syncStatus.highestBlock)).toFixed(2)) < 98) {
      new Notification("Send function locked", alert);
    } else if (this.syncStatus.currentBlock == undefined) {
      new Notification("Gmc not started synchronization yet", alert);
    } else {
      this.$.sendDialogMenu.open();
    }
  },
  restoreDefaultNodeList: function() {
      if (platform.includes("win32")) {
        var oldList = nw.__dirname + '\\bootnodes.json.org';
        var actualtList =  nw.__dirname + '\\bootnodes.json';
      } else if (platform.includes("darwin")) {
        var oldList = nw.__dirname + '/bootnodes.json.org';
        var actualtList =  nw.__dirname + '/bootnodes.json';
      } else if (platform.includes("linux")) { //linux
        var oldList = nw.__dirname + '/bootnodes.json.org';
        var actualtList =  nw.__dirname + '/bootnodes.json';
      }
      
    copyFile(oldList, actualtList, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
  },
  backupAccount: function(e) {
    var account = e.model.account.address.slice(2);
    document.getElementById('fileDialogBackup').click();
    document.querySelector('#fileDialogBackup').addEventListener("change", function() {
    var tmpPath = this.value;
    username1().then(username1 => {
      if (platform.includes("win32")) {
        var pathOfKey = 'C:\\Users\\' + username1 + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = '/Users/' + username1 + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = '/home/' + username1 + '/.musicoin/keystore/';
      }
    Finder.in(pathOfKey).findFiles(account, function(pathOfAccount) {
    var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
    copyFile(String(pathOfAccount), filePath, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
      var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "You need to KNOW password for every account to unlock it." +
        " You can locate your account in: \n" + tmpPath + " directory."};
      new Notification("Backup in " + tmpPath, alert);
      var win = nw.Window.get();
      win.reloadIgnoringCache();
      });
    });
  });
  },
  showExplorerWindow: function(e) {
    gui.Window.open('https://orbiter.musicoin.org/addr/' + e.model.account.address,{position: 'center', width: 1000, height: 600});
  },
  activePeers: function() {
    var bootnodes = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
    var client = jayson.client.http('http://localhost:8545');
    client.request('admin_peers', [], function(err, response) {
      if(err) throw err;
    var aPeers = JSON.parse(JSON.stringify(response.result));
    for(var i = 0; i < aPeers.length; i++) {
    document.querySelector("msc-profile-view").addOrRemove(bootnodes.nodes, "enode://" + aPeers[i].id + "@" + aPeers[i].network.remoteAddress);
    fs.writeFile('bootnodes.json', JSON.stringify(bootnodes, null, 4), 'utf-8');
    }
    });
  },
  addOrRemove: function(arr, val) {
    if (!_.includes(arr, val)) {
    arr.unshift(val);
    } else {
    //_.remove(arr, item => item === val);
    }
    console.log(arr);
  },
  addPeers: function(e) {
    var obj = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
    var remoteNodes = [];
    for(var i = 0; i< obj['nodes'].length; i++) {
      remoteNodes.push(obj['nodes'][i]);
    }
    console.log(remoteNodes);
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
  createNewAccount: function(e) {
    var v1 = this.$.newAccountPassword.value;
    var v2 = this.$.newAccountPasswordVerify.value;
    if (v1 == v2) {
      mscIntf.accountModule.createAccount(this.$.newAccountPassword.value)
        .then(account => this.txStatus = "Created account: " + account)
        .catch(err => this.txStatus = "Failed to create account: " + err);
      this.clearNewAccountFields();
      this.$.newAccountDialog.close();
    } else {
      alert("Passwords do not match!");
      return false;
    }

  },
  getMarketValue: function() {   
    market.getTicker({ limit: 1, currency: 'musicoin' })
      .then(result => resultObj = JSON.parse(JSON.stringify(result)))
      .then(usd => this.musicUsd = JSON.parse(JSON.stringify(usd[0].price_usd)))
      .catch(error => console.log(error));
    market.getTicker({ limit: 1, currency: 'musicoin' })
      .then(result => resultObj = JSON.parse(JSON.stringify(result)))
      .then(btc => this.musicBtc = JSON.parse(JSON.stringify(btc[0].price_btc)))
      .catch(error => console.log(error));
  },
  setCustomCoinbase: function() {
    if (this.$.customCoinbase.value && this.$.customCoinbase.value.trim().length > 0) {
      mscIntf.accountModule.setCoinbase(this.$.customCoinbase.value);
    }
  },
  sendCoins: function() {
    this.txStatus = "Sending coins...";
    mscIntf.accountModule.sendCoins(
      this.$.recipient.value,
      this.$.coins.value,
      this.$.sender.value,
      this.$.sendPassword.value
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
  clearNewAccountFields: function() {
    this.$.newAccountPasswordVerify.value = "";
    this.$.newAccountPassword.value = "";
  },
  clearSendFields: function() {
    this.$.recipient.value = "";
    this.$.coins.value = "";
    this.$.sendPassword.value = "";
    this.$.sender.value = "";
  }
});
  
    var menu = new nw.Menu({ type: 'menubar' });
    if (platform.includes("darwin")) {
      menu.createMacBuiltin('Musicoin-wallet',{hideEdit: true, hideWindow: true});
      } else {}
    var account = new nw.Menu();
    account.append(new nw.MenuItem({ label: 'New Account', key: 'n', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").handleNewAccount(); } }));
    account.append(new nw.MenuItem({ label: 'Import Account', key: 'i', modifiers: 'ctrl', click: function() { document.getElementById('fileDialog').click(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Send Funds', key: 's', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").showSendDialogFromMenu(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Open Keystore (manual backup)', key: 'b', modifiers: 'ctrl', click: function() { document.querySelector("msc-profile-view").backupWallet(); } }));
    account.append(new nw.MenuItem({ type: 'separator' }));
    account.append(new nw.MenuItem({ label: 'Quit', key: 'q', modifiers: 'ctrl', click: function() { require('process').exit(0); } }));
    menu.append(new nw.MenuItem({label: 'Account', submenu: account }));
    var explorer = new nw.Menu();
    explorer.append(new nw.MenuItem({ label: 'Open Explorer #1', key: 'e', modifiers: 'ctrl', click: function() { gui.Window.open('https://orbiter.musicoin.org/',{position: 'center', width: 1000, height: 600}); } }));
    explorer.append(new nw.MenuItem({ label: 'Open Explorer #2', key: 'e', modifiers: 'ctrl+cmd', click: function() { gui.Window.open('https://explorer.musicoin.org/',{position: 'center', width: 1000, height: 600}); } }));
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
    official.append(new nw.MenuItem({ label: 'Bitcointalk: Musicoin', key: 'f', modifiers: 'ctrl', click: function() { gui.Window.open('https://bitcointalk.org/index.php?topic=1776113.0',{position: 'center', width: 1000, height: 600}); } }));
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
    help.append(new nw.MenuItem({ label: 'Wallet Quickstart', key: 'F1', modifiers: 'ctrl', click: function() { alert('blank') } }));
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
    var minutes = 2;
    var interval = minutes * 60 * 1000;
    setInterval(function() {
      document.querySelector("msc-profile-view").activePeers();
    }, interval);
    ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
    //console.log("  System time  :" + new Date());
    //console.log("  Network time :" + date);
    var nDate = date.setSeconds(0,0);
    var sDate = (new Date()).setSeconds(0,0);
    
    if(err) {
        console.error(err);
        return;
    } else if (nDate != sDate) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
      var alert = {
        icon: iconPath,
        body: "Please enable network time synchronisation in system settings. \n" +
        (date.toString()).slice(0, -18) + " UTC +0"};
      new Notification("System clock seems incorrect", alert);
    } else {}
      });
    });
    
    
