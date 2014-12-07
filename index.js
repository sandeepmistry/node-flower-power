var events = require('events');
var util = require('util');

var noble = require('noble');

var SERVICE_UUID                            = '39e1fa0084a811e2afba0002a5d5c51b';

var SYSTEM_ID_UUID                          = '2a23';
var SERIAL_NUMBER_UUID                      = '2a25';
var FIRMWARE_REVISION_UUID                  = '2a26';
var HARDWARE_REVISION_UUID                  = '2a27';

var BATTERY_LEVEL_UUID                      = '2a19';

var SUNLIGHT_UUID                           = '39e1fa0184a811e2afba0002a5d5c51b';
var SOIL_EC_UUID                            = '39e1fa0284a811e2afba0002a5d5c51b';
var SOIL_TEMPERATURE_UUID                   = '39e1fa0384a811e2afba0002a5d5c51b';
var AIR_TEMPERATURE_UUID                    = '39e1fa0484a811e2afba0002a5d5c51b';
var SOIL_MOISTURE_UUID                      = '39e1fa0584a811e2afba0002a5d5c51b';
var LIVE_MODE_PERIOD_UUID                   = '39e1fa0684a811e2afba0002a5d5c51b';
var LED_UUID                                = '39e1fa0784a811e2afba0002a5d5c51b';
var LAST_MOVE_DATE_UUID                     = '39e1fa0884a811e2afba0002a5d5c51b';

var FRIENDLY_NAME_UUID                      = '39e1fe0384a811e2afba0002a5d5c51b';
var COLOR_UUID                              = '39e1fe0484a811e2afba0002a5d5c51b';

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

FlowerPower.prototype.writeDataCharacteristic = function(uuid, data, callback) {
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

FlowerPower.prototype.readFriendlyName = function(callback) {
  this.readStringCharacteristic(FRIENDLY_NAME_UUID, callback);
};

FlowerPower.prototype.writeFriendlyName = function(friendlyName, callback) {
  var friendlyNameBuffer = new Buffer(friendlyName);
  var data = new Buffer('00000000000000000000000000000000000000', 'hex');

  for (var i = 0; (i < friendlyNameBuffer.length) && (i < data.length); i++) {
    data[i] = friendlyNameBuffer[i];
  }

  this.writeDataCharacteristic(FRIENDLY_NAME_UUID, data, callback);
};

FlowerPower.prototype.readColor = function(callback) {
  this.readDataCharacteristic(COLOR_UUID, function(data) {
    var colorCode = data.readUInt16LE(0);

    var COLOR_CODE_MAPPER = {
      4: 'brown',
      6: 'green',
      7: 'blue'
    };

    var color = COLOR_CODE_MAPPER[colorCode] || 'unknown';

    callback(color);
  }.bind(this));
};

FlowerPower.prototype.convertSunlightData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  var sunlight = 0.08640000000000001 * (192773.17000000001 * Math.pow(rawValue, -1.0606619));

  return sunlight;
};

FlowerPower.prototype.readSunlight = function(callback) {
  this.readDataCharacteristic(SUNLIGHT_UUID, function(data) {
    var sunlight = this.convertSunlightData(data);

    callback(sunlight);
  }.bind(this));
};

FlowerPower.prototype.onSunlightChange = function(data) {
  var sunlight = this.convertSunlightData(data);

  this.emit('sunlightChange', sunlight);
};

FlowerPower.prototype.notifySunlight = function(callback) {
  this.notifyCharacteristic(SUNLIGHT_UUID, true, this.onSunlightChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySunlight = function(callback) {
  this.notifyCharacteristic(SUNLIGHT_UUID, false, this.onSunlightChange.bind(this), callback);
};

FlowerPower.prototype.convertSoilElectricalConductivityData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  // TODO: convert raw (0 - 1771) to 0 to 10 (mS/cm)
  var soilElectricalConductivity = rawValue;

  return soilElectricalConductivity;
};

FlowerPower.prototype.readSoilElectricalConductivity = function(callback) {
  this.readDataCharacteristic(SOIL_EC_UUID, function(data) {
    var soilEC = this.convertSoilElectricalConductivityData(data);

    callback(soilEC);
  }.bind(this));
};

FlowerPower.prototype.onSoilElectricalConductivityChange = function(data) {
  var temperature = this.convertSoilElectricalConductivityData(data);

  this.emit('soilElectricalConductivityChange', temperature);
};

FlowerPower.prototype.notifySoilElectricalConductivity = function(callback) {
  this.notifyCharacteristic(SOIL_EC_UUID, true, this.onSoilElectricalConductivityChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilElectricalConductivity = function(callback) {
  this.notifyCharacteristic(SOIL_EC_UUID, false, this.onSoilElectricalConductivityChange.bind(this), callback);
};

FlowerPower.prototype.convertTemperatureData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  var temperature = 0.00000003044 * Math.pow(rawValue, 3.0) - 0.00008038 * Math.pow(rawValue, 2.0) + rawValue * 0.1149 - 30.449999999999999;

  if (temperature < -10.0) {
    temperature = -10.0;
  } else if (temperature > 55.0) {
    temperature = 55.0;
  }

  return temperature;
};

FlowerPower.prototype.readSoilTemperature = function(callback) {
  this.readDataCharacteristic(SOIL_TEMPERATURE_UUID, function(data) {
    var temperature = this.convertTemperatureData(data);

    callback(temperature);
  }.bind(this));
};

FlowerPower.prototype.onSoilTemperatureChange = function(data) {
  var temperature = this.convertTemperatureData(data);

  this.emit('soilTemperatureChange', temperature);
};

FlowerPower.prototype.notifySoilTemperature = function(callback) {
  this.notifyCharacteristic(SOIL_TEMPERATURE_UUID, true, this.onSoilTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilTemperature = function(callback) {
  this.notifyCharacteristic(SOIL_TEMPERATURE_UUID, false, this.onSoilTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.readAirTemperature = function(callback) {
  this.readDataCharacteristic(AIR_TEMPERATURE_UUID, function(data) {
    var temperature = this.convertTemperatureData(data);

    callback(temperature);
  }.bind(this));
};

FlowerPower.prototype.onAirTemperatureChange = function(data) {
  var temperature = this.convertTemperatureData(data);

  this.emit('airTemperatureChange', temperature);
};

FlowerPower.prototype.notifyAirTemperature = function(callback) {
  this.notifyCharacteristic(AIR_TEMPERATURE_UUID, true, this.onAirTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyAirTemperature = function(callback) {
  this.notifyCharacteristic(AIR_TEMPERATURE_UUID, false, this.onAirTemperatureChange.bind(this), callback);
};


FlowerPower.prototype.convertSoilMoistureData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  var soilMoisture = 11.4293 + (0.0000000010698 * Math.pow(rawValue, 4.0) - 0.00000152538 * Math.pow(rawValue, 3.0) +  0.000866976 * Math.pow(rawValue, 2.0) - 0.169422 * rawValue);

  soilMoisture = 100.0 * (0.0000045 * Math.pow(soilMoisture, 3.0) - 0.00055 * Math.pow(soilMoisture, 2.0) + 0.0292 * soilMoisture - 0.053);

  if (soilMoisture < 0.0) {
    soilMoisture = 0.0;
  } else if (soilMoisture > 60.0) {
    soilMoisture = 60.0;
  }

  return soilMoisture;
};

FlowerPower.prototype.readSoilMoisture = function(callback) {
  this.readDataCharacteristic(SOIL_MOISTURE_UUID, function(data) {
    var soilMoisture = this.convertSoilMoistureData(data);

    callback(soilMoisture);
  }.bind(this));
};

FlowerPower.prototype.onSoilMoistureChange = function(data) {
  var soilMoisture = this.convertSoilMoistureData(data);

  this.emit('soilMoistureChange', soilMoisture);
};

FlowerPower.prototype.notifySoilMoisture = function(callback) {
  this.notifyCharacteristic(SOIL_MOISTURE_UUID, true, this.onSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilMoisture = function(callback) {
  this.notifyCharacteristic(SOIL_MOISTURE_UUID, false, this.onSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.enableLiveModeWithPeriod = function(period, callback) {
  this.notifySunlight(function() {
    this.notifySoilElectricalConductivity(function() {
      this.notifySoilTemperature(function() {
        this.notifyAirTemperature(function() {
          this.notifySoilMoisture(function() {
            this.writeDataCharacteristic(LIVE_MODE_PERIOD_UUID, new Buffer([period]), callback);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

FlowerPower.prototype.enableLiveMode = function(callback) {
  this.enableLiveModeWithPeriod(1, callback);
};

FlowerPower.prototype.disableLiveMode = function(callback) {
  this.writeDataCharacteristic(LIVE_MODE_PERIOD_UUID, new Buffer([0x00]), function() {
    this.unnotifySunlight(function() {
      this.unnotifySoilElectricalConductivity(function() {
        this.unnotifySoilTemperature(function() {
          this.unnotifyAirTemperature(function() {
            this.unnotifySoilMoisture(function() {
              callback();
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

FlowerPower.prototype.ledPulse = function(callback) {
  this.writeDataCharacteristic(LED_UUID, new Buffer([0x01]), callback);
};

FlowerPower.prototype.ledOff = function(callback) {
  this.writeDataCharacteristic(LED_UUID, new Buffer([0x00]), callback);
};

module.exports = FlowerPower;
