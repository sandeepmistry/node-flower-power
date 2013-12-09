node-flower-power
=================

node.js lib for the [Parrot Flower Power](http://www.parrot.com/flowerpower/usa/)


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

__Battery Level__

    // batteryLevel range is 0 - 100
    flowerPower.readBatteryLevel(callback(batteryLevel));

__Sunlight__

    // sunlight units are photons per square meter 
    flowerPower.readSunlight(callback(sunlight));

__Temperature__

    flowerPower.readTemperature(callback(temperatureC, temperatureF));

__Soil Moisture__

    // soilMoisture units is percentage (%)
    flowerPower.readSoilMoisture(callback(soilMoisture));

__Live mode__

    // sunlightChange, temperatureChange, soilMoistureChange events are emitted (see below)

    flowerPower.enableLiveMode(callback);

    flowerPower.disableLiveMode(callback);

Events 
------

__Disconnect__

    flowerPower.on('disconnect', callback);

__Sunlight Change__

    flowerPower.on('sunlightChange', callback(sunlight));

__Temperature Change__

    flowerPower.on('temperatureChange', callback(temperatureC, temperatureF));

__Soil Moisture Change__

    flowerPower.on('soilMoistureChange', callback(soilMoisture));

TSRP client
===========
Executing:

    npm -l install
    node flower-power-tsrp.js

will run a script that continuously looks for Flower Power devices,
queries them at 1 hour intervals,
and then rebroadcasts the information using [TSRP](http://thethingsystem.com/dev/Thing-Sensor-Reporting-Protocol.html).

If more than one instance of this script is running (on different hosts) in a network,
then at the instances will determine which one is responsible for polling any given Flower Power.
Typically, this is based on highest RSSI value.
If an instance fails, the responsibility for polling a particular Flower Power will failover automatically.

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
  * __use calculations to convert values__ (currently using lookup table)

