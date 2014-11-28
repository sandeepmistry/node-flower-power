var async = require('async');

var FlowerPower = require('./index');

FlowerPower.discover(function(flowerPower) {
  async.series([
    function(callback) {
      flowerPower.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
      });

      flowerPower.on('sunlightChange', function(sunlight) {
        console.log('sunlight = ' + sunlight.toFixed(2));
      });

      flowerPower.on('soilTemperatureChange', function(temperature) {
        console.log('soil temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('airTemperatureChange', function(temperature) {
        console.log('air temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('soilMoistureChange', function(soilMoisture) {
        console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%');
      });

      console.log('connect');
      flowerPower.connect(callback);
    },
    function(callback) {
      console.log('discoverServicesAndCharacteristics');
      flowerPower.discoverServicesAndCharacteristics(callback);
    },
    function(callback) {
      console.log('readSystemId');
      flowerPower.readSystemId(function(systemId) {
        console.log('\tsystem id = ' + systemId);
        callback();
      });
    },
    function(callback) {
      console.log('readSerialNumber');
      flowerPower.readSerialNumber(function(serialNumber) {
        console.log('\tserial number = ' + serialNumber);
        callback();
      });
    },
    function(callback) {
      console.log('readFirmwareRevision');
      flowerPower.readFirmwareRevision(function(firmwareRevision) {
        console.log('\tfirmware revision = ' + firmwareRevision);
        callback();
      });
    },
    function(callback) {
      console.log('readHardwareRevision');
      flowerPower.readHardwareRevision(function(hardwareRevision) {
        console.log('\thardware revision = ' + hardwareRevision);
        callback();
      });
    },
    function(callback) {
      console.log('readBatteryLevel');
      flowerPower.readBatteryLevel(function(batteryLevel) {
        console.log('battery level = ' + batteryLevel);

        callback();
      });
    },
    function(callback) {
      console.log('readFriendlyName');
      flowerPower.readFriendlyName(function(friendlyName) {
        console.log('\tfriendly name = ' + friendlyName);

        console.log('writeFriendlyName');
        flowerPower.writeFriendlyName(friendlyName, callback);
      });
    },
    function(callback) {
      console.log('readColor');
      flowerPower.readColor(function(color) {
        console.log('\tcolor = ' + color);

        callback();
      });
    },
    function(callback) {
      console.log('readSunlight');
      flowerPower.readSunlight(function(sunlight) {
        console.log('sunlight = ' + sunlight.toFixed(2));

        callback();
      });
    },
    function(callback) {
      console.log('readSoilTemperature');
      flowerPower.readSoilTemperature(function(temperature) {
        console.log('soil temperature = ' + temperature.toFixed(2) + '°C');

        callback();
      });
    },
    function(callback) {
      console.log('readAirTemperature');
      flowerPower.readAirTemperature(function(temperature) {
        console.log('air temperature = ' + temperature.toFixed(2) + '°C');

        callback();
      });
    },
    function(callback) {
      console.log('readSoilMoisture');
      flowerPower.readSoilMoisture(function(soilMoisture) {
        console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%');

        callback();
      });
    },
    function(callback) {
      console.log('enableLiveMode');
      flowerPower.enableLiveMode(callback);
    },
    function(callback) {
      console.log('live mode');
      setTimeout(callback, 5000);
    },
    function(callback) {
      console.log('disableLiveMode');
      flowerPower.disableLiveMode(callback);
    },
    function(callback) {
      console.log('disconnect');
      flowerPower.disconnect(callback);
    }
  ]);
});
