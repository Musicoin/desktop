// Object to capture process exits and call app specific cleanup function

function noOp() {};

const child_process = require('child_process');
var fs = require('fs');

function Startup(logger, appDataDir) {
  this.logger = logger;
  this.appDataDir = appDataDir;
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir);
  }
}

Startup.prototype.execAndKillOnShutdown = function(name, absolutePath, command, args) {
  var logger = this.logger;
  logger.log("Starting " + name + ": " + command + ", args: [" + args + "], cwd: " + absolutePath);
  var child = child_process.spawn(command, args, {cwd: absolutePath});
  logger.log("Started " + name + ": pid=" + child.pid);
  child.stdout.on('data', function(data) {
    logger.log(name + " stdout: " + data);
  });

  child.on('error', function(error) {
    logger.log("Failed to start child process " + name + ": " + error);
  });

  child.stderr.on('data', function(data) {
    logger.log(name + " stderr: " + data);
  });

  child.on('close', function(code) {
    logger.log(name + ": child process exited with code " + code);
  });

  this.onShutdown(function() {
    // logger.log(name + " shutting down pid=" + child.pid);
    // TODO: This is causing some problems for ipfs, which does not clean up it's lock file
    // leaving this out for now until we find a workaround.
    // child.kill();
  });
};

Startup.prototype.initChain = function(commandObj) {
  this.initCommand(commandObj);
  if (!fs.existsSync(commandObj.chainDir)) {
    fs.mkdirSync(commandObj.chainDir);
  }
};

Startup.prototype.startChildProcess = function(commandObj) {
  this.initCommand(commandObj);
  this.execAndKillOnShutdown(commandObj.name, commandObj.absolutePath, commandObj.command, commandObj.args);
};

Startup.prototype.initCommand = function(commandObj) {
  this.logger.log("Initializing command: " + JSON.stringify(commandObj));
  if (commandObj.path) commandObj.absolutePath = this.injectPathVariables(commandObj.path);
  if (commandObj.command) commandObj.command = this.injectPathVariables(commandObj.command);
  if (commandObj.args) {
    for (var i=0; i < commandObj.args.length; i++) {
      commandObj.args[i] = this.injectPathVariables(commandObj.args[i]);
    }
  }
  if (commandObj.chainDir) commandObj.chainDir = this.injectPathVariables(commandObj.chainDir)
  this.logger.log("Initialized command: " + JSON.stringify(commandObj));
};

Startup.prototype.injectPathVariables = function(p) {
  p = p.split("{appdata}").join(this.appDataDir);
  p = p.split("{process.cwd}").join(process.cwd());
  return p;
};

Startup.prototype.onShutdown = function(callback) {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup',callback);

  // do app specific cleaning before exiting
  process.on('exit', function () {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  var logger = this.logger;
  process.on('SIGINT', function () {
    logger.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    logger.log('Uncaught Exception...');
    logger.log(e.stack);
    process.exit(99);
  });
};

module.exports = Startup;