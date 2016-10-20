const staticData = require('./static-data.js');
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
  {subproperties:'toolSettings',prop:'contractImagesPath',initVal:'images/'},
  {subproperties:'toolSettings',prop:'uploadedImagesDir',initVal:'images/'},
  //for test purposes only TODO: remove when obsolete
  {subproperties:'toolSettings',prop:'ipfsTestData',initVal:{
    tx:'hdjfns112222',
    hash:'hdjfns112222',
    contract:'hdjfns112222',
    status:'pending',
  }},
  {subproperties:'worksEditor',prop:'contributors',
  //just test data, TODO: delete when real available
  initVal:[
    {name:'Anna Karenina', role:'manager', shares:'50'},
    {name:'Anna Karenina', role:'manager', shares:'50'},
    {name:'Anna Karenina', role:'manager', shares:'50'},
    {name:'Anna Karenina', role:'manager', shares:'50'},
  ]
  },
  //just test data, TODO: delete when real available
  {subproperties:'financialData',prop:'parityData',initVal:{
    account:'aaa8888aaa888',accounts:'notsurewhatgoeshere',balance:100000,mining:1000,coinbase:9999,syncing:'???',status:'Idle',customBalance:'232313',transaction:'aa1188ddd',receipt:'99kk11ss'
  }},
  {subproperties:'financialData',prop:'userBalance',initVal:0},
  {subproperties:'financialData',prop:'pendingPayments',initVal:0},
  {subproperties:'financialData',prop:'amountToPay',initVal:0},
  {prop:'contractGroups',
  //just test data, TODO: delete when real available
  initVal:[
    {name:'something',contracts:[
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
      {contractId:'abc123', img:'darude.jpg',artist:'Darude',album:'Sandstorm',track:'Sandstorm'},
    ]
  }
  ],

  //initVal:[]
  },
];

module.exports = function (baseObj) {
  for (var i = 0, targetObj,obs,j; obs = observables[i]; i++) {
    targetObj = obs.subproperties? obs.subproperties.split('.').reduce((previous, current) => {
      return previous[current];
    }, baseObj):baseObj;
    observable(targetObj,obs.prop,obs.initVal);
  }
}
