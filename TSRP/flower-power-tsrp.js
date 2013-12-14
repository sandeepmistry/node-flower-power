var FlowerPower = require('../index')
  , dgram       = require('dgram')
  , os          = require('os')
  ;


var devices = {};

FlowerPower.discover(function(peripheral) {
  var uuid;

  uuid = peripheral.uuid;
  if (!devices[uuid]) devices[uuid] = { uuid: uuid, name: peripheral.name, props: {}, peripheral: peripheral };
  devices[uuid].state = 'discovered';
  devices[uuid].props.lastSample = new Date().getTime();

  peripheral.on('disconnect', function() {
    var device;

    device = devices[uuid];
    device.state = 'disconnected';
    device.props.lastSample = new Date().getTime();

    tsrp(uuid);
  }).connect(onconnect(uuid));
});

var onconnect = function(uuid) {
  return function(err) { didconnect(err, uuid); };
};

var didconnect = function(err, uuid) {
  var device     = devices[uuid]
    , peripheral = device.peripheral;

  if (!!err) return console.log(device.name + ': ' + err.message);

  device.state = 'connected';
  device.props.rssi = peripheral._peripheral.rssi;
  device.props.lastSample = new Date().getTime();

  peripheral.discoverServicesAndCharacteristics(function() {
    var i;

    if (!device.serialNumber) {
      return peripheral.readSerialNumber(function(serialNumber) {
        device.serialNumber = serialNumber;
        return peripheral.disconnect();
      });
    }

    i = 4;
    peripheral.readBatteryLevel(function(batteryLevel) {
      device.props.batteryLevel = batteryLevel;
      if (--i === 0) return peripheral.disconnect();
      device.props.lastSample = new Date().getTime();
    });
    peripheral.readSunlight(function(sunlight) {
      // sunlight is PPF (photons per square meter), convert to lux
      // according to http://www.apogeeinstruments.com/conversion-ppf-to-lux/
      device.props.light = sunlight * 54;
      if (--i === 0) return peripheral.disconnect();
      device.props.lastSample = new Date().getTime();
    });
    peripheral.readTemperature(function(temperatureC, temperatureF) {/* jshint unused: false */
      var antoine;

      antoine = 8.07131 - (1730.63 / (233.426 + temperatureC));

      device.props.temperature = temperatureC;
      device.lastPressure = Math.pow(10, antoine - 2);
      if (--i === 0) return peripheral.disconnect();
      device.props.lastSample = new Date().getTime();
    });
    peripheral.readSoilMoisture(function(relativeHumidity) {
      // moisture = relativeHumidity * (saturationVaporPressure(temperatureC) / 100);
      if (device.lastPressure) device.props.moisture = relativeHumidity * device.lastPressure;
      if (--i === 0) return peripheral.disconnect();
      device.props.lastSample = new Date().getTime();
    });
  });
};

setInterval(function() {
  var device, now, uuid;

  now = new Date().getTime();
  for (uuid in devices) {
    if (!devices.hasOwnProperty(uuid)) continue;
    device = devices[uuid];
    if ((device.state !== 'disconnected') || (!!device.remote)) continue;

    device.peripheral.connect(onconnect(uuid));
  }
}, 60 * 60 * 1000);

setInterval(function() {
  var device, now, uuid;

  now = new Date().getTime();
  for (uuid in devices) {
    if (!devices.hasOwnProperty(uuid)) continue;
    device = devices[uuid];
    if ((device.state !== 'disconnected') || (!!device.remote)) continue;

    if (!!device.serialNumber) { tsrp(uuid); continue; }

    console.log('retry serialNumber: ' + uuid + ' (rssi ' + device.props.rssi + ')');
    device.peripheral.connect(onconnect(uuid));
  }
}, 45 * 1000);


var ipaddr    = '224.192.32.20'
  , portno    = 22601
  , requestID = Math.round(Math.random() * Math.pow(2, 31)) - 1
  , socket
  ;

var ifApply = function(cb) {
  var ifa, ifaddrs, ifname, ifaces;

  ifaces = os.networkInterfaces();
  for (ifname in ifaces) {
    if (!ifaces.hasOwnProperty(ifname)) continue;

    ifaddrs = ifaces[ifname];
    for (ifa = 0; ifa < ifaddrs.length; ifa++) {
      if ((!ifaddrs[ifa].internal) && (ifaddrs[ifa].family === 'IPv4')) cb(ifname, ifaddrs[ifa].address);
    }
  }
};

ifApply(function(ifname, ifaddr) {
  var ifsock = dgram.createSocket('udp4');

  ifsock.on('message', function(message, rinfo) {
    var device, deviceType, i, instance, remote, report, rssi, thing, uuid;

/*
    console.log('>>> rinfo:   ' + JSON.stringify(rinfo));
    console.log('>>> message: ' + message.toString());
 */
    
    try { report = JSON.parse(message); } catch(ex) { return console.log('TSRP error: ' + ex.message); }

    if ((!report.requestID) || (report.path !== '/api/v1/thing/reporting')) return;

    for (deviceType in report.things) {
      if (!report.things.hasOwnProperty(deviceType)) continue;
      thing = report.things[deviceType];

      if (!thing.instances) continue;
      for (i = 0; i < thing.instances.length; i++) {
        instance = thing.instances[i];
        if ((!instance.unit) || (!instance.unit.udn) || (instance.unit.udn.indexOf('uuid:') !== 0)
                || (!instance.info) || (isNaN(instance.info.rssi))) continue;

        rssi = instance.info.rssi;
        uuid = instance.unit.udn.substring(5);
        for (device in devices) {
          if ((!devices.hasOwnProperty(device)) || (device !== uuid)) continue;
          remote = devices[device].remote;

          if ((!!remote) && ((remote.rssi < rssi) || ((remote.rssi === rssi) && (remote.requestID < report.requestID)))) {
            devices[device].remote = { rinfo: rinfo, requestID: report.requestID, rssi: rssi };
          }
          devices[device].remote.nextUpdate = new Date().getTime() + (60 * 1000 * 1000);

          if ((device.props.rssi > device.remote.rssi) || (requestID > device.remote.requestID)) delete(device.remote);
        }
      }
    }
  }).on('listening', function() {
    console.log('listening on ' + ifname + ' for multicast udp://' + ipaddr + ':' + portno);

    this.addMembership(ipaddr);
  }).on('error', function(err) {
    console.log('socket error: ' + err.message);
  }).bind(portno, ifaddr);  

  if (!socket) socket = ifsock;
});


var tsrp = function(uuid) {
  var device, json, packet;

  device = devices[uuid];
  if (!device.serialNumber) return;

  json = { path                                    : '/api/v1/thing/reporting'
         , requestID                               : requestID.toString()
         , things                                  :
           { '/device/climate/flower-power/plant'  :
             { prototype                           :
               { device                            :
                 { name                            : 'Flower Power'
                 , maker                           : 'Parrot'
                 }
               , name                              : true
               , status                            : [ 'recent', 'absent' ]
               , properties                        :
                 { 'temperature'                   : 'celsius'
                 , 'light'                         : 'lux'
                 , 'moisture'                      : 'millibars'
                 , 'batteryLevel'                  : 'percentage'
                 , 'rssi'                          : 's8'
                 }
               }
             , instances                           :
               [
                 { name                            : device.name
                 , status                          : 'recent'
                 , unit                            :
                   { 'serial'                      : device.serialNumber
                   , 'udn'                         : 'uuid:' + device.uuid
                   }
                 , info                            : device.props
                 }
               ]
             }
           }
         };
  requestID++;

  packet = new Buffer(JSON.stringify(json));
  socket.send(packet, 0, packet.length, portno, ipaddr, function(err, octets) {/* jshint unused: false */
    if (!!err) console.log('socket.send: ' + err.message);
  });
};
