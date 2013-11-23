var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('pseudo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Flower power ???', ['39e1fa0084a811e2afba0002a5d5c51b']);
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
            uuid: '2a23',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a24',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a25',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a26',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a27',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a28',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a29',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a2a',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '2a50',
            properties: ['read']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '39e1fa0084a811e2afba0002a5d5c51b',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fa0184a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
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
            uuid: '39e1fa0484a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0584a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0684a811e2afba0002a5d5c51b',
            properties: ['read', 'write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0784a811e2afba0002a5d5c51b',
            properties: ['read', 'write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fa0884a811e2afba0002a5d5c51b',
            properties: ['read', 'notify']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '180f',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '2a19',
            properties: ['read', 'notify']
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
            uuid: '39e1fe0184a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0284a811e2afba0002a5d5c51b',
            properties: ['read']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0384a811e2afba0002a5d5c51b',
            properties: ['read','write']
          }),
          new BlenoCharacteristic({
            uuid: '39e1fe0484a811e2afba0002a5d5c51b',
            properties: ['read']
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
