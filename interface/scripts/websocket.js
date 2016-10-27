var estWS = new (function () {
  this.open = false;
  this.ws = {};
  this.init = function(srv, port, dest, broadcaster, service) {
    var self = this;
    this.ws = new WebSocket('ws://'+srv+':'+port+'/'+dest);
    this.ws.onopen = function(){
      this.open = true;
      broadcaster.fire('iron-signal', {name:'ws-state-'+service,data:{body:{wsOn:true}}});
    }
    this.ws.onclose = function(e){
      this.open = false;
      broadcaster.fire('iron-signal', {name:'ws-state-'+service,data:{body:{wsOn:false}}});
      setTimeout(function(){self.init(srv, port, dest, broadcaster)},500);
    }
    this.ws.onerror = function(e) {
    }
    this.ws.onmessage = function (e) {
      var received_msg = JSON.parse(e.data);
      // console.log(received_msg);
      console.log('RECV-'+service,received_msg);
        broadcaster.fire('iron-signal', {name:received_msg.result?received_msg.result.relmethod:received_msg.error.code,data:{body:received_msg.result?received_msg.result.data:received_msg.error.message, id:0}});
    }
    return this;
  }
})()
