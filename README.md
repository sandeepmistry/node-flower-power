node-flower-power
=================

[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/node-flower-power?pixel)](https://github.com/igrigorik/ga-beacon)

node.js lib for the [Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/)


Install
-------

npm install flower-power

Usage
-----

    var FlowerPower = require('flower-power');

__Discover__

    FlowerPower.discover(callback(flowerPower));

__Connect__

    flowerPower.connect(callback);

__Disconnect__

    flowerPower.disconnect(callback);

__Discover Services and Characteristics__

    flowerPower.discoverServicesAndCharacteristics(callback);

__Device Info__

    flowerPower.readSystemId(callback(systemId));

    flowerPower.readSerialNumber(callback(serialNumber));

    flowerPower.readFirmwareRevision(callback(firmwareRevision));

    flowerPower.readHardwareRevision(callback(hardwareRevision));

__Other Info__

    flowerPower.readFriendlyName(callback(friendlyName));

    flowerPower.writeFriendlyName(friendlyName, callback);


    flowerPower.readColor(callback(color));

__Battery Level__

    // batteryLevel range is 0 - 100
    flowerPower.readBatteryLevel(callback(batteryLevel));

__Sunlight__

    // sunlight units are photons per square meter
    flowerPower.readSunlight(callback(sunlight));

__Soil Temperature__

    flowerPower.readSoilTemperature(callback(temperature)); // C

__Air Temperature__

    flowerPower.readAirTemperature(callback(temperature)); // C

__Soil Moisture__

    // soilMoisture units is percentage (%)
    flowerPower.readSoilMoisture(callback(soilMoisture));

__Live mode__

    // sunlightChange, soilTemperatureChange, airTemperatureChange, soilMoistureChange events are emitted (see below)

    flowerPower.enableLiveMode(callback);

    flowerPower.disableLiveMode(callback);

Events
------

__Disconnect__

    flowerPower.on('disconnect', callback);

__Sunlight Change__

    flowerPower.on('sunlightChange', callback(sunlight));

__Soil Temperature Change__

    flowerPower.on('soilTemperatureChange', callback(soilTemperature));

__Air Temperature Change__

    flowerPower.on('airTemperatureChange', callback(airTemperature));

__Soil Moisture Change__

    flowerPower.on('soilMoistureChange', callback(soilMoisture));

TODO
----

  * ~~discover~~
  * ~~connect~~
  * ~~discover~~
  * ~~discover services and characteristics~~
  * ~~read device info~~
    * ~~system id~~
    * ~~serial number~~
    * ~~firmware revision~~
    * ~~hardware revision~~
  * ~~read battery level~~
  * ~~read sunlight~~
  * ~~read temperature~~
  * ~~read soil moisture~~
  * ~~live mode~~
    * ~~sunlight~~
    * ~~temperature~~
    * ~~soil moisture~~
  * read fertilizer
  * read historic data
    * sunlight
    * temperature
    * soil moisture
    * fertizler
  * ~~__use calculations to convert values__ (currently using lookup table)~~

