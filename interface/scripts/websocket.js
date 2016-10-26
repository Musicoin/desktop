var estWS = new (function () {
  this.open = false;
  this.ws = {};
  this.init = function(srv, port, dest, broadcaster) {
    var self = this;
    this.ws = new WebSocket('ws://'+srv+':'+port+'/'+dest);
    this.ws.onopen = function(){
      this.open = true;
      broadcaster.fire('iron-signal', {name:'ws-state',data:true});
    }
    this.ws.onclose = function(e){
      this.open = false;
      broadcaster.fire('iron-signal', {name:'ws-state',data:false});
      setTimeout(function(){self.init(srv, port, dest, broadcaster)},500);
    }
    this.ws.onerror = function(e) {
    }
    this.ws.onmessage = function (e) {
      var received_msg = e.data;
      console.log(received_msg);
    }
    return this;
  }
})()
