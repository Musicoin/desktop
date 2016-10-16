module.exports = function(obj,prop,initValue) {
  Object.defineProperty(obj,'__'+prop,{
    writable: true,
    enumerable: true,
    configurable: true,
    value:initValue});
  Object.defineProperty(obj,'__'+prop+'_binding',{
    writable: true,
    enumerable: true,
    configurable: true,
    value:null});

  Object.defineProperty(obj,prop,{
    get: function() { return obj['__'+prop]; },
    set: function(newValue) {
      if (newValue.register) {
        obj['__'+prop+'_binding'] = [];
        obj['__'+prop+'_binding'].push({elem:newValue.register,prop:newValue.prop});
        newValue.register.set(newValue.prop,obj['__'+prop]);
      } else {
        obj['__'+prop] = (newValue.updatePolymer)?newValue.data:newValue;
        if (obj['__'+prop+'_binding'] && obj['__'+prop+'_binding'].length>0) {
          for (var i = 0,binding; binding = obj['__'+prop+'_binding'][i]; i++) {
            binding.elem.set(binding.prop,obj['__'+prop]);
          }
        }
      }
    },
    enumerable: true,
    configurable: true
  });
}
