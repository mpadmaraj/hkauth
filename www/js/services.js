angular.module('starter.services', [])

  .factory('recordService', function() {

      var recordService={};
    return recordService;
  })
    .factory('hkSocket', function (socketFactory) {
        var hkadmin = io.connect(SERVER_URL);
        var socket = socketFactory({
            ioSocket: hkadmin
        });
        socket.forward('broadcast');
        return socket;
    });
