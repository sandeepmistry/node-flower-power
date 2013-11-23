var async = require('async');

var FlowerPower = require('./index');

FlowerPower.discover(function(flowerPower) {
  async.series([
    function(callback) {
      flowerPower.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
      });

      console.log('connect');
      flowerPower.connect(callback);
    },
    function(callback) {
      console.log('disconnect');
      flowerPower.disconnect(callback);
    }
  ]);
});
