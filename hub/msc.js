
var fs = require('fs-extra');
var os = require('os');

var platform = os.platform();


if (process.env.APPDATA != undefined && process.env.APPDATA.includes("Settings")) { //hack for XP
  var musicoinRoot = process.env.APPDATA.slice(0,-17) + '\\AppData\\Roaming\\Musicoin';
} else if (platform.includes("win32")) {
  var musicoinRoot = process.env.APPDATA + '\\Musicoin';
  var configFolderHome = musicoinRoot + '\\config';
} else if (platform.includes("darwin")) {
  var musicoinRoot = process.env.HOME + '/Library/Musicoin';
  var configFolderHome = musicoinRoot + '/config';
} else if (platform.includes("linux")) { //linux
  var musicoinRoot = process.env.HOME + "/.musicoin";
}
var appData = musicoinRoot + "/wallet-ui";
var logDir = appData + "/logs";
var configFolder = process.cwd() + '/config';
var pathOfNodes = musicoinRoot + '/bootnodes.json';
var configFolderHome = musicoinRoot + '/config';
var settings = musicoinRoot + '/config/settings.js';

if (!fs.existsSync(musicoinRoot)) fs.mkdirSync(musicoinRoot);
if (!fs.existsSync(appData)) fs.mkdirSync(appData);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
if (fs.existsSync(pathOfNodes)) fs.removeSync(pathOfNodes);
if (!fs.existsSync(pathOfNodes)) fs.copySync(process.cwd() + '/bootnodes.json', pathOfNodes);
if (!fs.existsSync(configFolderHome)) fs.copySync(configFolder, configFolderHome);
if (!fs.existsSync(settings)) fs.copySync(configFolder + '/settings.js', settings);

if (fs.existsSync(musicoinRoot + '/chaindata')) fs.remove(musicoinRoot + '/chaindata');
if (fs.existsSync(musicoinRoot + '/dapp')) fs.remove(musicoinRoot + '/dapp');
if (fs.existsSync(musicoinRoot + '/nodekey')) fs.remove(musicoinRoot + '/nodekey');
if (fs.existsSync(musicoinRoot + '/nodes')) fs.remove(musicoinRoot + '/nodes');

/* console - convenience console emulation to output messages to stdout */
const console = require('./console.log.js')(logDir);
console.log(`process.platform: ${process.platform}`);
console.log(`process.env.APPDATA: ${process.env.APPDATA}`);
console.log(`process.env.HOME: ${process.env.HOME}`);

/* observables init array together with init fn */
/* crypto for pwd ops */
var util = require('util');
var Promise = require('bluebird');

/* node localstorage to ensure existence of a kind of app storage without db. Can be substituted later with a kind of encrypted store */
var settings;
try {
  settings = require(musicoinRoot + '/config/config.ext.js');
} catch (e) {
  settings = require(musicoinRoot + '/config/config.std.js');
}

/* Run startup actions (currently, start geth and ipfs if they aren't already started) */
var Startup = require('./startup.js');
var startup = new Startup(console, appData);
if (settings.startup.chain) startup.startChildProcess(settings.chain);

var mschub = {
  financialData: {}
};

/* here we init observables defined in observables-defs.js */
var PropertyChangeSupport = require('./pcs.js');
var pcs = new PropertyChangeSupport(mschub);

pcs.addObservable('selectedPage', '');
pcs.addObservable('hideIntroWindow', false);
pcs.addObservable('chainVersion', settings.chain.name);
var pcsFinData = new PropertyChangeSupport(mschub.financialData);
pcsFinData.addObservable('accounts', []);
pcsFinData.addObservable('userBalance', 0);

var Web3Connector = require('./web3-connector.js');
pcs.addObservable('syncStatus', {});

var web3Connector = new Web3Connector(settings.chain, mschub, function(connected, err) {
  if (err) {
    throw err;
  }
  if (connected) {
    mschub.financialData.accounts = web3Connector.getAccounts();
    console.log(web3Connector.getAccounts());
  }
});

mschub.userPreferences = {};
var pcsUserPrefs = new PropertyChangeSupport(mschub.userPreferences);
pcsUserPrefs.addObservable('username', '');

mschub.clientUtils = require('../facade/client-utils.js')(web3Connector, logDir);
mschub.accountModule = require('../facade/account.js')(web3Connector);

pcs.addObservable('version', 'unknown');
fs.exists("version.txt", function(exists) {
  if (exists) {
    fs.readFile("version.txt", function(err, result) {
      if (err) {
        console.log("Checking version... failed: " + err);
        return;
      }
      console.log("Version " + result);
      mschub.version = result;
    })
  } else {
    console.log("Checking version failed... version file does not exist");
  }
});

mschub.financialData.userBalance = 0;

/* Here we export the hub's reference to be accessible for the interface */
exports.mscdata = mschub
