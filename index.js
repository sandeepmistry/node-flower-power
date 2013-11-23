var events = require('events');
var util = require('util');

var noble = require('noble');

var SERVICE_UUID = '39e1fa0084a811e2afba0002a5d5c51b';

function FlowerPower(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.uuid = peripheral.uuid;
  this.name = peripheral.advertisement.localName;

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
}

util.inherits(FlowerPower, events.EventEmitter);

FlowerPower.discover = function(callback) {
  var startScanningOnPowerOn = function() {
    if (noble.state === 'poweredOn') {
      var onDiscover = function(peripheral) {
        noble.removeListener('discover', onDiscover);

        noble.stopScanning();

        var flowerPower = new FlowerPower(peripheral);

        callback(flowerPower);
      };

      noble.on('discover', onDiscover);

      noble.startScanning([SERVICE_UUID]);
    } else {
      noble.once('stateChange', startScanningOnPowerOn);
    }
  };

  startScanningOnPowerOn();
};

FlowerPower.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

FlowerPower.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    name: this.name
  });
};

FlowerPower.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

FlowerPower.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

FlowerPower.prototype.discoverServicesAndCharacteristics = function(callback) {
  this._peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
    if (error === null) {
      for (var i in services) {
        var service = services[i];
        this._services[service.uuid] = service;
      }

      for (var j in characteristics) {
        var characteristic = characteristics[j];

        this._characteristics[characteristic.uuid] = characteristic;
      }
    }

    callback(error);
  }.bind(this));
};

module.exports = FlowerPower;
