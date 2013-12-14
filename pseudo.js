var os = require('os');
var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

if (os.platform() !== 'linux') {
  console.warn('this script only supports Linux!');
}

console.log('pseudo - Flower Power');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingWithEIRData(new Buffer('02010611061bc5d5a50200baafe211a88400fae13902ff00', 'hex'),
                                      new Buffer('1209466c6f77657220706f776572203030303005120a006400020a00', 'hex'));
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart ' + error);

  if (!error) {
    bleno.setServices([
      // new BlenoPrimaryService({
      //   uuid: '1800',
      //   characteristics: [
      //     new BlenoCharacteristic({
      //       uuid: '2a00',
      //       properties: ['read', 'writeWithoutResponse', 'write']
      //     }),
      //     new BlenoCharacteristic({
      //       uuid: '2a01',
      //       properties: ['read']
      //     }),
      //     new BlenoCharacteristic({
      //       uuid: '2a02',
      //       properties: ['read', 'write']
      //     }),
      //     new BlenoCharacteristic({
      //       uuid: '2a03',
      //       properties: ['read', 'write']
      //     }),
      //     new BlenoCharacteristic({
      //       uuid: '2a04',
      //       properties: ['read']
      //     })
      //   ]
      // }),
      // new BlenoPrimaryService({
      //   uuid: '1801',
      //   characteristics: [
      //     new BlenoCharacteristic({
      //       uuid: '2a05',
      //       properties: ['indicate']
      //     }),
      //   ]
      // }),
      new BlenoPrimaryService({
        uuid: '180a',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '2a23', // system id
            properties: ['read'],
            value: new Buffer('0000000000000000', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: '2a24', //  model number
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a25', // serial number
            properties: ['read'],
            value: new Buffer('PI0000000000000000')
          }),
          new BlenoCharacteristic({
            uuid: '2a26', // firmware revision string
            properties: ['read'],
            value: new Buffer('2013-09-05_hawaii-1.0.0_hardware-config-MP')
          }),
          new BlenoCharacteristic({
            uuid: '2a27', // hardware revision string
            properties: ['read'],
            value: new Buffer('013-07-26_hawaiiProduction-1.2_protoDV-bootloader')
          }),
          new BlenoCharacteristic({
            uuid: '2a28', // software revision string
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a29', // manufacturer name string
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a2a', // IEEE 11073-20601 regulatory certification data list
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a50', // PnP id
            properties: ['read']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fa0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fa0184a811e2afba0002a5d5c51b', // sunlight
            properties: ['read', 'notify'],
            onSubscribe: function(maxValueSize, updateValueCallback) {
              console.log('39e1fa0184a811e2afba0002a5d5c51b subscribe');
            },
            onUnsubscribe: function() {
              console.log('39e1fa0184a811e2afba0002a5d5c51b unsubscribe');
            }
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0284a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0384a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0484a811e2afba0002a5d5c51b', // temperature
            properties: ['read', 'notify'],
            onSubscribe: function(maxValueSize, updateValueCallback) {
              console.log('39e1fa0484a811e2afba0002a5d5c51b subscribe');
            },
            onUnsubscribe: function() {
              console.log('39e1fa0484a811e2afba0002a5d5c51b unsubscribe');
            }
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0584a811e2afba0002a5d5c51b', // soil moisture
            properties: ['read', 'notify'],
            onSubscribe: function(maxValueSize, updateValueCallback) {
              console.log('39e1fa0484a811e2afba0002a5d5c51b subscribe');
            },
            onUnsubscribe: function() {
              console.log('39e1fa0484a811e2afba0002a5d5c51b unsubscribe');
            }
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0684a811e2afba0002a5d5c51b', // live mode enable/disable
            properties: ['read', 'write'],
            value: new Buffer([0x00]),
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('write 39e1fa0684a811e2afba0002a5d5c51b: ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0784a811e2afba0002a5d5c51b',
            properties: ['read', 'write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0884a811e2afba0002a5d5c51b', // ???
            properties: ['read', 'notify'],
            value: new Buffer('7a680500', 'hex')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '180f',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '2a19', // battery level
            properties: ['read', 'notify'],
            value: new Buffer([100])
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fc0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fc0184a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fc0284a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fc0384a811e2afba0002a5d5c51b',
            properties: ['read','write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fc0484a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fc0584a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fc0684a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fb0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fb0184a811e2afba0002a5d5c51b',
            properties: ['notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fb0284a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fb0384a811e2afba0002a5d5c51b',
            properties: ['read', 'write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fb0484a811e2afba0002a5d5c51b',
            properties: ['read', 'write']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fd0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fd0184a811e2afba0002a5d5c51b',
            properties: ['read']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fe0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fe0184a811e2afba0002a5d5c51b', // ???
            properties: ['read'],
            value: new Buffer('0000eb00e702ffffffff9e00f40262058c05fc', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0284a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0384a811e2afba0002a5d5c51b', // friendly name
            properties: ['read','write'],
            value: new Buffer('466c6f77657220706f776572203030303000cc', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0484a811e2afba0002a5d5c51b', // color
            properties: ['read'],
            value: new Buffer('0700', 'hex')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: 'f000ffc004514000b000000000000000',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'f000ffc104514000b000000000000000',
            properties: ['read', 'writeWithoutResponse', 'write']
          }),
          new BlenoCharacteristic({
            uuid: 'f000ffc204514000b000000000000000',
            properties: ['read', 'writeWithoutResponse', 'write']
          })
        ]
      })
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('on -> servicesSet');
});
