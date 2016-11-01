// Object to capture process exits and call app specific cleanup function

function noOp() {};

const child_process = require('child_process');

var execAndKillOnShutdown = function(name, command, dir) {
  var child = child_process.exec(command, {cwd: process.cwd() + dir});
  child.stdout.on('data', function(data) {
    console.log(name + " stdout: " + data);
  });

  child.stderr.on('data', function(data) {
    console.log(name + " stderr: " + data);
  });

  child.on('close', function(code) {
    console.log(name + ": child process exited with code " + code);
  });

  // TODO: This isn't working, although all the docs that I'm reading say it should
  exports.onShutdown(function() {
    console.log(name + " shutting down pid=" + ipfs.pid);
    child.kill();
  });
};

exports.onStartup = function(callback) {
  console.log("Starting up... ");
};

exports.startIPFS = function(ipfsPath) {
  execAndKillOnShutdown("ipfs", "ipfs daemon", ipfsPath);
};

exports.startGeth = function(gethPath) {
  execAndKillOnShutdown("geth", 'geth --rpc --rpcapi="db,eth,net,web3,personal" --rpcport "8545" --rpcaddr "127.0.0.1" --rpccorsdomain "localhost" --testnet', gethPath);
}

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
    console.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
  });
};