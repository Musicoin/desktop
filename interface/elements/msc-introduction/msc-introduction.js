var fs = require('fs-extra');
var gui = require('nw.gui');
var path = require('path');
var Finder = require('fs-finder');
var os = require('os');
var platform = os.platform();
var ethers = require('ethers');
var zxcvbn = require('zxcvbn');

if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
  var introduction = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\introduction.intro';
  var pathOfNodes = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
} else if (platform.includes("win32")) {
  var introduction = process.env.APPDATA + '\\Musicoin\\introduction.intro';
  var pathOfNodes = process.env.APPDATA + '\\Musicoin\\bootnodes.json';
} else if (platform.includes("darwin")) {
  var introduction = process.env.HOME + '/Library/Musicoin/introduction.intro';
  var pathOfNodes = process.env.HOME + '/Library/Musicoin/bootnodes.json';
} else if (platform.includes("linux")) { //linux
  var introduction = process.env.HOME + '/.musicoin/introduction.intro';
  var pathOfNodes = process.env.HOME + '/.musicoin/bootnodes.json';
}
Polymer({
  is: 'msc-introduction',
  properties: {
    accounts: String,
    username: String,
    nodeId: String,
    locale: Object,
    chainVersion: String,
    version: String,
    accounts: Array,
    firstBlock: {
      type: Number,
      value: -1
    },
    actionState: {
      type: String,
      value: "None"
    }
  },
  ready: function() {
    mscIntf.attach(this)
      .to('locale')
      .to('version')
      .to('chainVersion')

    setTimeout(function() {
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

    this.txStatus = "Loading default remote Node list";
    mscIntf.accountModule.addPeers(remoteNodes)
      .then(() => this.txStatus = "Default list of remote nodes loaded")
      .delay(5000)
      .then(() => this.txStatus = "")
      .catch(err => this.txStatus = "Failed to load default list: " + err);
    },20000);
  },
  hideIntroWindow: function() {
    fs.writeFile(introduction, "Intro was created");
    mscIntf.hideIntroWindow = true;
  },
  _hideIntroStatus: function() {
    if (fs.existsSync(introduction)) {
      mscIntf.hideIntroWindow = true;
      return true;
    }
    return false;
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
    if (password1 == password2 && password1.length > 0 && zxcvbn(password1).score >= 2) {
      // It's important to show Notification before mnemonic generation, otherwise we would see alert first
      new Notification("Save mnemonic", mnemonicNotification);
      var mnemonic = ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
      var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
      wallet.encrypt(password1, { scrypt: { N: 262144 } }).then(function(finalAccount) {
      finalAccountTmp = JSON.parse(finalAccount);
      account = finalAccountTmp.address;
      pathOfKey = (pathOfKey + new Date().toISOString() + '--' + account).split(':').join('-');
      fs.writeFile(pathOfKey, finalAccount, 'utf-8');
      document.querySelector("msc-introduction").backupAccount(account);
      document.getElementById('backup').style.display = 'block';
      document.getElementById('introStatus').textContent = "";
      document.getElementById('introStatus').textContent = "Created account: " + "0x" + account; });
      this.clearNewAccountFieldsMnemonic();
      this.$.newMnemonicAccountDialog.close();
      alert(mnemonic);
    } else {
      alert("Password does not match the confirm password, was empty or just too easy to guess");
      return false;
    }
  },
  clearNewAccountFieldsMnemonic: function() {
    document.getElementById('newAccountPasswordMnemonicIntro').value = "";
    document.getElementById('newAccountPasswordMnemonicVerifyIntro').value = "";
  },
  patchOverlay: function (e) {
    // hack from: https://stackoverflow.com/a/31510980
    if (e.target.withBackdrop) {
      e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
    }
  },
  backupAccount: function(account) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    document.getElementById('fileDialogBackup').click();
    var firstAlert = {
        icon: iconPath,
        body: "Select directory to backup new created account"};
    new Notification("Select directory", firstAlert);
    document.querySelector('#fileDialogBackup').addEventListener("change", function() {
    var tmpPath = this.value;
      if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
        var pathOfKey = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin\\keystore\\';
      } else if (platform.includes("win32")) {
        var pathOfKey = process.env.APPDATA + '\\Musicoin\\keystore\\';
      } else if (platform.includes("darwin")) {
        var pathOfKey = process.env.HOME + '/Library/Musicoin/keystore/';
      } else if (platform.includes("linux")) { //linux
        var pathOfKey = process.env.HOME + '/.musicoin/keystore/';
      }
    Finder.in(pathOfKey).findFiles(account, function(pathOfAccount) {
    var filePath = tmpPath + '/' + path.basename(String(pathOfAccount));
    fs.copy(String(pathOfAccount), filePath, function(error) {
      if (error) return console.error(error);
       console.log('File was copied!')
      });
      var alert = {
        icon: iconPath,
        body: "You need to KNOW password for every account to unlock it." +
        " You can locate your account in: \n" + tmpPath + " directory."};
      new Notification("Backup in " + tmpPath, alert);
      });
  });
  }
});
