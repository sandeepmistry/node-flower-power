node-flower-power
=================

[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/node-flower-power?pixel)](https://github.com/igrigorik/ga-beacon)

node.js lib for the [Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/)


Install
-------

```sh
npm install flower-power
```

Usage
-----

```javascript
var FlowerPower = require('flower-power');
```

__Discover__

```javascript
// Discover one Flower Power
FlowerPower.discover(callback(flowerPower));

// Discover all Flower Power's
FlowerPower.discoverAll(callback(flowerPower));
```

__Connect and Setup__

```javascript
flowerPower.connectAndSetup(callback(error));
```

__Disconnect__

```javascript
flowerPower.disconnect(callback(error));
```

__Device Info__

```javascript
flowerPower.readSystemId(callback(error, systemId));

flowerPower.readSerialNumber(callback(error, serialNumber));

flowerPower.readFirmwareRevision(callback(error, firmwareRevision));

flowerPower.readHardwareRevision(callback(error, hardwareRevision));

flowerPower.readManufacturerName(callback(error, manufacturerName));
```

__Other Info__

```javascript
flowerPower.readFriendlyName(callback(error, friendlyName));

flowerPower.writeFriendlyName(friendlyName, callback(error));


flowerPower.readColor(callback(error, color));
```

__Battery Level__

```javascript
// batteryLevel range is 0 - 100
flowerPower.readBatteryLevel(callback(error, batteryLevel));
```

__Sunlight__

```javascript
// sunlight units are photons per square meter
flowerPower.readSunlight(callback(error, sunlight));
```

__Soil Temperature__

```javascript
flowerPower.readSoilTemperature(callback(error, temperature)); // C
```

__Air Temperature__

```javascript
flowerPower.readAirTemperature(callback(error, temperature)); // C
```

__Soil Moisture__

```javascript
// soilMoisture units is percentage (%)
flowerPower.readSoilMoisture(callback(error, soilMoisture));
```

__Calibrated__

```javascript
// firmware versions 1.1 and above

flowerPower.readCalibratedSoilMoisture(callback(error, soilMoisture)); // %

flowerPower.readCalibratedAirTemperature(callback(error, temperature)); // C

flowerPower.readCalibratedSunlight(callback(error, sunlight)); // photons per square meter (mol/m²/d)

flowerPower.readCalibratedEa(callback(error, ea)); // no units

flowerPower.readCalibratedEcb(callback(error, ecb)); // dS/m

flowerPower.readCalibratedEcPorous(callback(error, ecPorous)); // dS/m
```

__Live mode__

```javascript
// sunlightChange, soilTemperatureChange, airTemperatureChange,
// soilMoistureChange events are emitted (see below)

flowerPower.enableLiveMode(callback(error));

flowerPower.disableLiveMode(callback(error));
```

__Calibrated live mode__

```javascript
// firmware versions 1.1 and above

// calibratedSoilMoistureChange, calibratedAirTemperatureChange,
// calibratedSunlightChange, calibratedEaChange, calibratedEcbChange,
// calibratedEcPorousChange events are emitted (see below)

flowerPower.enableCalibratedLiveMode(callback(error));

flowerPower.disableCalibratedLiveMode(callback(error));
```

__LED__

```javascript
flowerPower.ledFade(callback(error));

flowerPower.ledOff(callback(error));
```

Events
------

__Disconnect__

```javascript
flowerPower.on('disconnect', callback);
```

__Sunlight Change__

```javascript
flowerPower.on('sunlightChange', callback(sunlight));
```

__Soil Temperature Change__

```javascript
flowerPower.on('soilTemperatureChange', callback(soilTemperature));
```

__Air Temperature Change__

```javascript
flowerPower.on('airTemperatureChange', callback(airTemperature));
```

__Soil Moisture Change__

```javascript
flowerPower.on('soilMoistureChange', callback(soilMoisture));
```

__Calibrated Change__
```javascript
flowerPower.on('calibratedSoilMoistureChange', callback(soilMoisture));
flowerPower.on('calibratedAirTemperatureChange', callback(temperature));
flowerPower.on('calibratedSunlightChange', callback(sunlight));
flowerPower.on('calibratedEaChange', callback(ea));
flowerPower.on('calibratedEcbChange', callback(ecb));
flowerPower.on('calibratedEcPorousChange', callback(ecPorous));
```


TODO
----
complete :)

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
  * ~~read fertilizer~~
  * ~~read historic data~~
    * ~~sunlight~~
    * ~~temperature~~
    * ~~soil moisture~~
    * ~~fertizler~~
  * ~~__use calculations to convert values__ (currently using lookup table)~~

