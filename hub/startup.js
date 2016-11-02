// Object to capture process exits and call app specific cleanup function

function noOp() {};

const child_process = require('child_process');
var fs = require('fs');

var execAndKillOnShutdown = function(logger, name, absolutePath, command) {
  logger.log("Starting " + name + ": " + command + ", cwd: " + absolutePath);
  var child = child_process.exec(command, {cwd: absolutePath});
  logger.log("Started " + name + ": pid=" + child.pid);
  child.stdout.on('data', function(data) {
    logger.log(name + " stdout: " + data);
  });

  child.stderr.on('data', function(data) {
    logger.log(name + " stderr: " + data);
  });

  child.on('close', function(code) {
    logger.log(name + ": child process exited with code " + code);
  });

  // TODO: This isn't working, although all the docs that I'm reading say it should
  exports.onShutdown(function() {
    logger.log(name + " shutting down pid=" + child.pid);
    child.kill();
  });
};

exports.init = function(appDataDir) {
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir);
  }
  console.log("appDataDir: " + appDataDir);
};

exports.start = function(logger, name, path, pathIsRelative, command) {
  var absolutePath = pathIsRelative ? process.cwd() + path : path;
  execAndKillOnShutdown(logger, name, absolutePath, command);
};

exports.onShutdown = function onShutdown(callback) {

  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup',callback);

  // do app specific cleaning before exiting
  process.on('exit', function () {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function () {
    process.stdout.write.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    process.stdout.write.log('Uncaught Exception...');
    process.stdout.write.log(e.stack);
    process.exit(99);
  });
};