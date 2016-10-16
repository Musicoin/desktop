const observable = require('./observable-factory.js');
/* observables defined below are meant to be static ones in a sense that their initial value is provided in explicit way (not referring to other objects).
observable is provided in a form:
{subproperties:'subprop1.subprop2.subprop3...', prop:'myNewProperty', initVal: 'some value'}
Subproperties can be a chain of existing subproperties objects separated by dots - '.'. They are parsed later on. If omitted new property is attached to provided object directly. Prop is a name of property. InitVal is initial value that is assigned on creation.
*/
var observables = [
  {prop:'lang', initVal: 'en'},
  {prop:'userDetails',initVal:{
    image:'user.png',
    name:'Johnny Appleseed',
    nick:''
  }},
  {prop:'currentPlay',initVal:{
    artist:'Johny Mnemonic',
    track:'Why should it be?',
    artwork:''
  }},
  {subproperties:'toolSettings',prop:'userImagePath',initVal:'images/'},
];

module.exports = function (baseObj) {
  for (var i = 0, targetObj,obs,j; obs = observables[i]; i++) {
    targetObj = obs.subproperties? obs.subproperties.split('.').reduce((previous, current) => {
      return previous[current];
    }, baseObj):baseObj;
    observable(targetObj,obs.prop,obs.initVal);
  }
}
