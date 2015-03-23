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
FlowerPower.discover(callback(flowerPower));
```

__Connect and Setup__

```javascript
flowerPower.connectAndSetup(callback);
```

__Disconnect__

```javascript
flowerPower.disconnect(callback);
```

__Device Info__

```javascript
flowerPower.readSystemId(callback(systemId));

flowerPower.readSerialNumber(callback(serialNumber));

flowerPower.readFirmwareRevision(callback(firmwareRevision));

flowerPower.readHardwareRevision(callback(hardwareRevision));

flowerPower.readManufacturerName(callback(manufacturerName));
```

__Other Info__

```javascript
flowerPower.readFriendlyName(callback(friendlyName));

flowerPower.writeFriendlyName(friendlyName, callback);


flowerPower.readColor(callback(color));
```

__Battery Level__

```javascript
// batteryLevel range is 0 - 100
flowerPower.readBatteryLevel(callback(batteryLevel));
```

__Sunlight__

```javascript
// sunlight units are photons per square meter
flowerPower.readSunlight(callback(sunlight));
```

__Soil Temperature__

```javascript
flowerPower.readSoilTemperature(callback(temperature)); // C
```

__Air Temperature__

```javascript
flowerPower.readAirTemperature(callback(temperature)); // C
```

__Soil Moisture__

```javascript
// soilMoisture units is percentage (%)
flowerPower.readSoilMoisture(callback(soilMoisture));
```

__Calibrated__

```javascript
// firmware versions 1.1 and above

flowerPower.readCalibratedSoilMoisture(callback(soilMoisture)); // %

flowerPower.readCalibratedAirTemperature(callback(temperature)); // C

flowerPower.readCalibratedSunlight(callback(sunlight)); // photons per square meter (mol/m²/d)

flowerPower.readCalibratedEa(callback(ea)); // no units

flowerPower.readCalibratedEcb(callback(ecb)); // dS/m

flowerPower.readCalibratedEcPorous(callback(ecPorous)); // dS/m
```

__Live mode__

```javascript
// sunlightChange, soilTemperatureChange, airTemperatureChange,
// soilMoistureChange events are emitted (see below)

flowerPower.enableLiveMode(callback);

flowerPower.disableLiveMode(callback);
```

__Calibrated live mode__

```javascript
// firmware versions 1.1 and above

// calibratedSoilMoistureChange, calibratedAirTemperatureChange,
// calibratedSunlightChange, calibratedEaChange, calibratedEcbChange,
// calibratedEcPorousChange events are emitted (see below)

flowerPower.enableCalibratedLiveMode(callback);

flowerPower.disableCalibratedLiveMode(callback);
```

__LED__

```javascript
flowerPower.ledFade(callback);

flowerPower.ledOff(callback);
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

