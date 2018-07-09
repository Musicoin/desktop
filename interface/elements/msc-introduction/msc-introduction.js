var fs = require('fs-extra');
var gui = require('nw.gui');
var path = require('path');
var Finder = require('fs-finder');
var os = require('os');
var platform = os.platform();
var ethers = require('ethers');
var zxcvbn = require('zxcvbn');
var request = require("request");

if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
  var introduction = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\introduction.intro';
  var pathOfNodes = process.env.APPDATA.slice(0, -17) + '\\AppData\\Roaming\\Musicoin\\bootnodes.json';
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
      .to('version')
      .to('chainVersion')

    setTimeout(function() {
      document.querySelector("msc-introduction").preLoadNodes(function(loadNodes) {
        nodesList = JSON.parse(loadNodes, 'utf-8');
        var remoteNodes = [];
        for (var i = 0; i < nodesList['nodes'].length; i++) {
          remoteNodes.push(nodesList['nodes'][i]);
        }
        //console.log(remoteNodes);
        mscIntf.accountModule.getNodeId()
          .then(result => {
            this.nodeId = result;
          });

        this.txStatus = document.querySelector("msc-introduction").echo('introductionJS_Loading_Nodes');
        mscIntf.accountModule.addPeers(remoteNodes)
          .then(() => this.txStatus = document.querySelector("msc-introduction").echo('profileJS_addPeers_default_list'))
          .delay(5000)
          .then(() => this.txStatus = "")
          .catch(err => this.txStatus = document.querySelector("msc-introduction").echo('profileJS_addPeers_failed_default_list') + err);
      });
    }, 12000);
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
  preLoadNodes: function(cb) {
    var url = 'https://raw.githubusercontent.com/cryptofuture/music-bootnodes/master/bootnodes.json';
    request({
      url: url,
      timeout: 10000,
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        cb(JSON.stringify(body));
      } else {
        cb(fs.readFileSync(pathOfNodes, 'utf-8'));
      }
    });
  },
  addExistingAccount: function() {
    document.getElementById('backup').style.display = 'none';
    document.getElementById('introStatus').textContent = "";
    document.getElementById('fileDialogIntro').value = "";
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    var alert = {
      icon: iconPath,
      body: document.querySelector("msc-introduction").echo('introductionJS_addExistingAccount_body1') +
        document.querySelector("msc-introduction").echo('introductionJS_addExistingAccount_body2')
    };
    document.getElementById('fileDialogIntro').click();
    new Notification(document.querySelector("msc-introduction").echo('introductionJS_addExistingAccount_Notification'), alert);
    document.querySelector('#fileDialogIntro').addEventListener("change", function() {
      var filePath = document.getElementById('fileDialogIntro').value;
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
        accountFile = JSON.parse(fs.readFileSync(pathOfKey, 'utf-8'));
        document.getElementById('backup').style.display = 'block';
        document.getElementById('introStatus').textContent = "Imported account: " + "0x" + accountFile.address;
      });
    });
  },
  handleMnemonicAccount: function() {
    this.$.newMnemonicAccountDialog.open();
  },
  createNewMnemonicAccount: function() {
    document.getElementById('backup').style.display = 'none';
    document.getElementById('introStatus').textContent = "";
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
      body: document.querySelector("msc-introduction").echo('profileJS_createNewMnemonicAccount_body')
    };
    var password1 = document.getElementById('newAccountPasswordMnemonicIntro').value;
    var password2 = document.getElementById('newAccountPasswordMnemonicVerifyIntro').value;
    if (password1 == password2 && password1.length > 0 && password1.length < 65 && zxcvbn(password1).score >= 2) {
      // It's important to show Notification before mnemonic generation, otherwise we would see alert first
      new Notification(document.querySelector("msc-introduction").echo('profileJS_createNewMnemonicAccount_Notification'), mnemonicNotification);
      var mnemonic = ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
      var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
      wallet.encrypt(password1, {
        scrypt: {
          N: 262144
        }
      }).then(function(finalAccount) {
        finalAccountTmp = JSON.parse(finalAccount);
        account = finalAccountTmp.address;
        accountName = (new Date().toISOString() + '--' + account).split(':').join('-');
        pathOfKey = pathOfKey + accountName;
        fs.writeFileSync(pathOfKey, finalAccount, 'utf-8');
        alert(mnemonic);
        document.querySelector("msc-introduction").backupAccount(pathOfKey);
        document.getElementById('backup').style.display = 'block';
        document.getElementById('introStatus').textContent = document.querySelector("msc-introduction").echo('introductionJS_createNewMnemonicAccount_introStatus') + "0x" + account;
      });
      this.clearNewAccountFieldsMnemonic();
      this.$.newMnemonicAccountDialog.close();
    } else if (password1 != password2) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-introduction").echo('profileJS_createNewAccount_password_match_failed'));
    } else if (password1 == password2 && password1.length > 64) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-introduction").echo('profileJS_createKeyFromMnemonicAction_64_bytes'));
    } else if (password1 == password2 && password1.length == 0) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-introduction").echo('profileJS_createNewAccount_password_empty'));
    } else if (password1 == password2 && zxcvbn(password1).score < 2) {
      this.clearNewAccountFieldsMnemonic();
      alert(document.querySelector("msc-introduction").echo('profileJS_createNewAccount_easy_password'));
    } else {
      this.clearNewAccountFieldsMnemonic();
      return false;
    }
  },
  clearNewAccountFieldsMnemonic: function() {
    document.getElementById('newAccountPasswordMnemonicIntro').value = "";
    document.getElementById('newAccountPasswordMnemonicVerifyIntro').value = "";
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
  patchOverlay: function(e) {
    // hack from: https://stackoverflow.com/a/31510980
    if (e.target.withBackdrop) {
      e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
    }
  },
  backupAccount: function(pathOfKey) {
    accountPath = pathOfKey;
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    document.getElementById('fileDialogBackupIntro').click();
    var firstAlert = {
      icon: iconPath,
      body: document.querySelector("msc-introduction").echo('introductionJS_backupAccount_body')
    };
    new Notification(document.querySelector("msc-introduction").echo('introductionJS_backupAccount_Notification'), firstAlert);
    document.querySelector('#fileDialogBackupIntro').addEventListener("change", function() {
      var tmpPath = this.value;
      var filePath = tmpPath + '/' + path.basename(String(accountPath));
      fs.copySync(String(accountPath), filePath);
      var alert = {
        icon: iconPath,
        body: document.querySelector("msc-introduction").echo('profileJS_backupWallet_Notification_body_1') +
          document.querySelector("msc-introduction").echo('profileJS_backupWallet_Notification_body_2') + "\n" + tmpPath + document.querySelector("msc-introduction").echo('profileJS_backupWallet_Notification_body_3')
      };
      new Notification(document.querySelector("msc-introduction").echo('profileJS_backupAccount_Notification') + tmpPath, alert);
      document.getElementById('fileDialogBackupIntro').value = "";
    });
  }
});
