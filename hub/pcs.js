function PropertyChangeSupport(obj) {
  this.pcsListeners = {};
  this.obj = obj;
  this.obj.attach = function(watcher) {
    return this.attach(watcher);
  }.bind(this);
}

PropertyChangeSupport.prototype.firePropertyChange = function (prop, oldValue, newValue) {
  if (this.pcsListeners[prop]) {
    this.pcsListeners[prop].forEach(function (listener) {
      listener(oldValue, newValue);
    })
  }
};
PropertyChangeSupport.prototype.addPropertyListener = function (prop, callback) {
  if (!this.pcsListeners[prop]) {
    this.pcsListeners[prop] = [];
  }
  this.pcsListeners[prop].push(callback);
};

PropertyChangeSupport.prototype.addObservable = function (prop, defaultValue, alwaysNotify) {
  // TODO: We could also use a Prototype for the mschub object
  // shadow value is required here because defineProperty cannot hold a value (state) and define
  // getter/setter at the same time.  why???
  var shadowValue = defaultValue;
  var subject = this.obj;
  var pcs = this;
  Object.defineProperty(subject, prop, {
    get: function () {
      return shadowValue
    },
    set: function (newValue) {
      var oldValue = subject[prop];
      if (alwaysNotify || oldValue != newValue) {
        shadowValue = newValue;
        pcs.firePropertyChange(prop, oldValue, newValue);
      }
    },
    enumerable: true,
    configurable: true
  });
};

PropertyChangeSupport.prototype.attach = function(watcher) {
  var subject = this.obj;
  var pcs = this;
  return {
    to: function(prop, fn) {
      if (!fn) {
        fn = function(oldValue, newValue) { watcher[prop] = newValue; }
      }
      else if ((Object.prototype.toString.call(fn) === '[object String]')) {
        var alias = fn;
        fn = function(oldValue, newValue) { watcher[alias] = newValue; }
      }
      pcs.addPropertyListener(prop, fn);
      fn(null, subject[prop]); // initialize on first call
      return this;
    }
  }
};

module.exports = PropertyChangeSupport;