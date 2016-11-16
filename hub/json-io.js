var Promise = require('bluebird');
var fs = require('fs');

module.exports.loadObject = function(fileName) {
  return new Promise(function(resolve, reject) {
    fs.exists(fileName, function(exists){
      if (!exists) return resolve(null);
      fs.readFile(fileName, 'utf8', function(err, result) {
        if (err) return reject(err);
        try {
          resolve(JSON.parse(result));
        }
        catch(parseError) {
          reject(parseError);
        }
      });
    });
  }.bind(this));
};

module.exports.saveObject = function(fileName, jsonObject) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fileName, JSON.stringify(jsonObject), 'utf8', function(err, result) {
      return err ? reject(err) : resolve(jsonObject);
    });
  }.bind(this));
};