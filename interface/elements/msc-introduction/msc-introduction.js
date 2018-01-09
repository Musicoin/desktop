var fs = require('fs');
var gui = require('nw.gui');
var path = require('path');
var username1 = require('username');
var copyFile = require('quickly-copy-file');
var Finder = require('fs-finder');
var platform = os.platform();
var introduction = os.homedir() + "/.musicoin/introduction.intro";

if (process.platform == 'darwin') {
    introduction = process.env.HOME + '/Library/Musicoin/introduction.intro';
} else if (process.platform && process.platform.startsWith("win")) {
    introduction = process.env.APPDATA + '/Musicoin/introduction.intro';
}

Polymer({
  is: 'msc-introduction',
  properties: {
    accounts: String,
    username: String,
    userImage: String,
    txStatus: String,
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
    var obj = JSON.parse(fs.readFileSync('bootnodes.json', 'utf-8'));
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
  handleNewAccount: function() {
    this.$.newAccountDialog.open();
  },
  createNewAccount: function(e) {
    var v1 = this.$.newAccountPassword.value;
    var v2 = this.$.newAccountPasswordVerify.value;
    if (v1 == v2) {
      mscIntf.accountModule.createAccount(this.$.newAccountPassword.value)
        .then(status => this.txStatus = "Created account: " + status)
        .then(account => document.querySelector("msc-introduction").backupAccount(account.slice(19)))
        .then(icon => document.getElementById('backup').style.display = 'block')
        .catch(err => this.txStatus = "Failed to create account: " + err);
      this.clearNewAccountFields();
      this.$.newAccountDialog.close();
    } else {
      alert("Passwords do not match!");
      return false;
    }

  },
  clearNewAccountFields: function() {
    this.$.newAccountPasswordVerify.value = "";
    this.$.newAccountPassword.value = "";
  },
  backupAccount: function(account) {
    var iconPath = 'file://' + nw.__dirname + '/favicon.png';
    document.getElementById('fileDialogBackup').click();
    var firstAlert = {
        icon: iconPath,
        body: "Select directory to backup new created account."};
    new Notification("Select directory", firstAlert);
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
      var alert = {
        icon: iconPath,
        body: "You need to KNOW password for every account to unlock it." +
        " You can locate your account in: \n" + tmpPath + " directory."};
      new Notification("Backup in " + tmpPath, alert);
      });
    });
  });
  }
});
