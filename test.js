var async = require('async');

var FlowerPower = require('./index');

var hasCalibratedData = false;

FlowerPower.discover(function(flowerPower) {
  async.series([
    function(callback) {
      flowerPower.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
      });

      flowerPower.on('sunlightChange', function(sunlight) {
        console.log('sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
      });

      // flowerPower.on('soilElectricalConductivityChange', function(soilElectricalConductivity) {
      //   console.log('soil electrical conductivity = ' + soilElectricalConductivity.toFixed(2));
      // });

      flowerPower.on('soilTemperatureChange', function(temperature) {
        console.log('soil temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('airTemperatureChange', function(temperature) {
        console.log('air temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('soilMoistureChange', function(soilMoisture) {
        console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%');
      });

      flowerPower.on('calibratedSoilMoistureChange', function(soilMoisture) {
        console.log('calibrated soil moisture = ' + soilMoisture.toFixed(2) + '%');
      });

      flowerPower.on('calibratedAirTemperatureChange', function(temperature) {
        console.log('calibrated air temperature = ' + temperature.toFixed(2) + '°C');
      });

      flowerPower.on('calibratedSunlightChange', function(sunlight) {
        console.log('calibrated sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
      });

      flowerPower.on('calibratedEaChange', function(ea) {
        console.log('calibrated EA = ' + ea.toFixed(2));
      });

      flowerPower.on('calibratedEcbChange', function(ecb) {
        console.log('calibrated ECB = ' + ecb.toFixed(2) + ' dS/m');
      });

      flowerPower.on('calibratedEcPorousChange', function(ecPorous) {
        console.log('calibrated EC porous = ' + ecPorous.toFixed(2)+ ' dS/m');
      });

      console.log('connectAndSetup');
      flowerPower.connectAndSetup(callback);
    },
    function(callback) {
      console.log('readSystemId');
      flowerPower.readSystemId(function(error, systemId) {
        console.log('\tsystem id = ' + systemId);
        callback();
      });
    },
    function(callback) {
      console.log('readSerialNumber');
      flowerPower.readSerialNumber(function(error, serialNumber) {
        console.log('\tserial number = ' + serialNumber);
        callback();
      });
    },
    function(callback) {
      console.log('readFirmwareRevision');
      flowerPower.readFirmwareRevision(function(error, firmwareRevision) {
        console.log('\tfirmware revision = ' + firmwareRevision);

        var version = firmwareRevision.split('_')[1].split('-')[1];

        hasCalibratedData = (version >= '1.1.0');

        callback();
      });
    },
    function(callback) {
      console.log('readHardwareRevision');
      flowerPower.readHardwareRevision(function(error, hardwareRevision) {
        console.log('\thardware revision = ' + hardwareRevision);
        callback();
      });
    },
    function(callback) {
      console.log('readManufacturerName');
      flowerPower.readManufacturerName(function(error, manufacturerName) {
        console.log('\tmanufacturer name = ' + manufacturerName);
        callback();
      });
    },
    function(callback) {
      console.log('readBatteryLevel');
      flowerPower.readBatteryLevel(function(error, batteryLevel) {
        console.log('battery level = ' + batteryLevel);

        callback();
      });
    },
    function(callback) {
      console.log('readFriendlyName');
      flowerPower.readFriendlyName(function(error, friendlyName) {
        console.log('\tfriendly name = ' + friendlyName);

        console.log('writeFriendlyName');
        flowerPower.writeFriendlyName(friendlyName, callback);
      });
    },
    function(callback) {
      console.log('readColor');
      flowerPower.readColor(function(error, color) {
        console.log('\tcolor = ' + color);

        callback();
      });
    },
    function(callback) {
      console.log('readSunlight');
      flowerPower.readSunlight(function(error, sunlight) {
        console.log('sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');

        callback();
      });
    },
    // function(callback) {
    //   console.log('readSoilElectricalConductivity');
    //   flowerPower.readSoilElectricalConductivity(function(error, soilElectricalConductivity) {
    //     console.log('soil electrical conductivity = ' + soilElectricalConductivity.toFixed(2));

    //     callback();
    //   });
    // },
    function(callback) {
      console.log('readSoilTemperature');
      flowerPower.readSoilTemperature(function(error, temperature) {
        console.log('soil temperature = ' + temperature.toFixed(2) + '°C');

        callback();
      });
    },
    function(callback) {
      console.log('readAirTemperature');
      flowerPower.readAirTemperature(function(error, temperature) {
        console.log('air temperature = ' + temperature.toFixed(2) + '°C');

        callback();
      });
    },
    function(callback) {
      console.log('readSoilMoisture');
      flowerPower.readSoilMoisture(function(error, soilMoisture) {
        console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%');

        callback();
      });
    },
    function(callback) {
      if (hasCalibratedData) {
        async.series([
          function(callback) {
            console.log('readCalibratedSoilMoisture');
            flowerPower.readCalibratedSoilMoisture(function(error, soilMoisture) {
              console.log('calibrated soil moisture = ' + soilMoisture.toFixed(2) + '%');

              callback();
            });
          },
          function(callback) {
            console.log('readCalibratedAirTemperature');
            flowerPower.readCalibratedAirTemperature(function(error, temperature) {
              console.log('calibrated air temperature = ' + temperature.toFixed(2) + '°C');

              callback();
            });
          },
          function(callback) {
            console.log('readCalibratedSunlight');
            flowerPower.readCalibratedSunlight(function(error, sunlight) {
              console.log('calibrated sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');

              callback();
            });
          },
          function(callback) {
            console.log('readCalibratedEa');
            flowerPower.readCalibratedEa(function(error, ea) {
              console.log('calibrated EA = ' + ea.toFixed(2));

              callback();
            });
          },
          function(callback) {
            console.log('readCalibratedEcb');
            flowerPower.readCalibratedEcb(function(error, ecb) {
              console.log('calibrated ECB = ' + ecb.toFixed(2) + ' dS/m');

              callback();
            });
          },
          function(callback) {
            console.log('readCalibratedEcPorous');
            flowerPower.readCalibratedEcPorous(function(error, ecPorous) {
              console.log('calibrated EC porous = ' + ecPorous.toFixed(2) + ' dS/m');

              callback();
            });
          },
          function() {
            callback();
          }
        ]);
      } else {
        callback();
      }
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
      if (hasCalibratedData) {
        async.series([
          function(callback) {
            console.log('enableCalibratedLiveMode');
            flowerPower.enableCalibratedLiveMode(callback);
          },
          function(callback) {
            console.log('calibrated live mode');
            setTimeout(callback, 5000);
          },
          function(callback) {
            console.log('disableCalibratedLiveMode');
            flowerPower.disableCalibratedLiveMode(callback);
          },
          function() {
            callback();
          }
        ]);
      } else {
        callback();
      }
    },
    function(callback) {
      console.log('ledPulse');
      flowerPower.ledPulse(callback);
    },
    function(callback) {
      console.log('delay');
      setTimeout(callback, 2000);
    },
    function(callback) {
      console.log('ledOff');
      flowerPower.ledOff(callback);
    },
    function(callback) {
      console.log('disconnect');
      flowerPower.disconnect(callback);
    }
  ]);
});
