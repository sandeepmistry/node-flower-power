var events = require('events');
var util = require('util');

var noble = require('noble');

var SERVICE_UUID                            = '39e1fa0084a811e2afba0002a5d5c51b';

var SYSTEM_ID_UUID                          = '2a23';
var SERIAL_NUMBER_UUID                      = '2a25';
var FIRMWARE_REVISION_UUID                  = '2a26';
var HARDWARE_REVISION_UUID                  = '2a27';

var BATTERY_LEVEL_UUID                      = '2a19';

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

FlowerPower.prototype.writeCharacteristic = function(uuid, data, callback) {
  this._characteristics[uuid].write(data, false, callback);
};

FlowerPower.prototype.notifyCharacteristic = function(uuid, notify, listener, callback) {
  var characteristic = this._characteristics[uuid];

  characteristic.notify(notify, function(state) {
    if (notify) {
      characteristic.addListener('read', listener);
    } else {
      characteristic.removeListener('read', listener);
    }

    callback();
  });
};

FlowerPower.prototype.readDataCharacteristic = function(uuid, callback) {
  this._characteristics[uuid].read(function(error, data) {
    callback(data);
  });
};

FlowerPower.prototype.readStringCharacteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i] === 0x00) {
        data = data.slice(0, i);
        break;
      }
    }

    callback(data.toString());
  });
};

FlowerPower.prototype.readSystemId = function(callback) {
  this.readDataCharacteristic(SYSTEM_ID_UUID, function(data) {
    var systemId = data.toString('hex').match(/.{1,2}/g).reverse().join(':');

    callback(systemId);
  });
};

FlowerPower.prototype.readSerialNumber = function(callback) {
  this.readStringCharacteristic(SERIAL_NUMBER_UUID, callback);
};

FlowerPower.prototype.readFirmwareRevision = function(callback) {
  this.readStringCharacteristic(FIRMWARE_REVISION_UUID, callback);
};

FlowerPower.prototype.readHardwareRevision = function(callback) {
  this.readStringCharacteristic(HARDWARE_REVISION_UUID, callback);
};

FlowerPower.prototype.readBatteryLevel = function(callback) {
  this.readDataCharacteristic(BATTERY_LEVEL_UUID, function(data) {
    callback(data.readUInt8(0));
  });
};

module.exports = FlowerPower;