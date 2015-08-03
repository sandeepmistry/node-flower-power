var events = require('events');
var util = require('util');
var async = require('async');

var NobleDevice = require('noble-device');

var LIVE_SERVICE_UUID                       = '39e1fa0084a811e2afba0002a5d5c51b';
var CALIBRATION_SERVICE_UUID                = '39e1fe0084a811e2afba0002a5d5c51b';

var SUNLIGHT_UUID                           = '39e1fa0184a811e2afba0002a5d5c51b';
var SOIL_EC_UUID                            = '39e1fa0284a811e2afba0002a5d5c51b';
var SOIL_TEMPERATURE_UUID                   = '39e1fa0384a811e2afba0002a5d5c51b';
var AIR_TEMPERATURE_UUID                    = '39e1fa0484a811e2afba0002a5d5c51b';
var SOIL_MOISTURE_UUID                      = '39e1fa0584a811e2afba0002a5d5c51b';
var LIVE_MODE_PERIOD_UUID                   = '39e1fa0684a811e2afba0002a5d5c51b';
var LED_UUID                                = '39e1fa0784a811e2afba0002a5d5c51b';
var LAST_MOVE_DATE_UUID                     = '39e1fa0884a811e2afba0002a5d5c51b';
var CALIBRATED_SOIL_MOISTURE_UUID           = '39e1fa0984a811e2afba0002a5d5c51b';
var CALIBRATED_AIR_TEMPERATURE_UUID         = '39e1fa0a84a811e2afba0002a5d5c51b';
var CALIBRATED_DLI_UUID                     = '39e1fa0b84a811e2afba0002a5d5c51b';
var CALIBRATED_EA_UUID                      = '39e1fa0c84a811e2afba0002a5d5c51b';
var CALIBRATED_ECB_UUID                     = '39e1fa0d84a811e2afba0002a5d5c51b';
var CALIBRATED_EC_POROUS_UUID               = '39e1fa0e84a811e2afba0002a5d5c51b';

var FRIENDLY_NAME_UUID                      = '39e1fe0384a811e2afba0002a5d5c51b';
var COLOR_UUID                              = '39e1fe0484a811e2afba0002a5d5c51b';
var CLOCK_SERVICE_UUID                      = '39e1fd0084a811e2afba0002a5d5c51b';
var CLOCK_CURRENT_TIME_UUID                 = '39e1fd0184a811e2afba0002a5d5c51b';

var UPLOAD_SERVICE_UUID                     = '39e1fb0084a811e2afba0002a5d5c51b';
var UPLOAD_TX_BUFFER_UUID                   = '39e1fb0184a811e2afba0002a5d5c51b';
var UPLOAD_TX_STATUS_UUID                   = '39e1fb0284a811e2afba0002a5d5c51b';
var UPLOAD_RX_STATUS_UUID                   = '39e1fb0384a811e2afba0002a5d5c51b';
var HISTORY_SERVICE_UUID                    = '39e1fc0084a811e2afba0002a5d5c51b';
var HISTORY_NB_ENTRIES_UUID                 = '39e1fc0184a811e2afba0002a5d5c51b';
var HISTORY_LASTENTRY_IDX_UUID              = '39e1fc0284a811e2afba0002a5d5c51b';
var HISTORY_TRANSFER_START_IDX_UUID         = '39e1fc0384a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_ID_UUID         = '39e1fc0484a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_START_IDX_UUID  = '39e1fc0584a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_PERIOD_UUID     = '39e1fc0684a811e2afba0002a5d5c51b';

var maxBufferSize = 128;

function FlowerPower(peripheral) {
  NobleDevice.call(this, peripheral);

  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};
  this.uuid = peripheral.uuid;
  this.name = peripheral.advertisement.localName;
  var flags = peripheral.advertisement.manufacturerData.readUInt8(0);
  this.flags={};
  this.flags.hasEntry = ((flags & (1<<0)) !== 0);
  this.flags.hasMoved = ((flags & (1<<1)) !== 0);
  this.flags.isStarting = ((flags & (1<<2)) !== 0);
  this._peripheral.on('disconnect', this.onDisconnect.bind(this));

}

NobleDevice.Util.inherits(FlowerPower, NobleDevice);
NobleDevice.Util.mixin(FlowerPower, NobleDevice.BatteryService);
NobleDevice.Util.mixin(FlowerPower, NobleDevice.DeviceInformationService, [
  'readSystemId',
  'readSerialNumber',
  'readFirmwareRevision',
  'readHardwareRevision',
  'readManufacturerName'
]);

FlowerPower.SCAN_UUIDS = [LIVE_SERVICE_UUID];

FlowerPower.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    name: this.name
  });
};

FlowerPower.prototype.readFriendlyName = function(callback) {
  this.readStringCharacteristic(CALIBRATION_SERVICE_UUID, FRIENDLY_NAME_UUID, callback);
};

FlowerPower.prototype.writeFriendlyName = function(friendlyName, callback) {
  var friendlyNameBuffer = new Buffer(friendlyName);
  var data = new Buffer('00000000000000000000000000000000000000', 'hex');

  for (var i = 0; (i < friendlyNameBuffer.length) && (i < data.length); i++) {
    data[i] = friendlyNameBuffer[i];
  }

  this.writeDataCharacteristic(CALIBRATION_SERVICE_UUID, FRIENDLY_NAME_UUID, data, callback);
};

FlowerPower.prototype.readColor = function(callback) {
  this.readDataCharacteristic(CALIBRATION_SERVICE_UUID, COLOR_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var colorCode = data.readUInt16LE(0);

    var COLOR_CODE_MAPPER = {
      4: 'brown',
      6: 'green',
      7: 'blue'
    };

    var color = COLOR_CODE_MAPPER[colorCode] || 'unknown';

    callback(null, color);
  }.bind(this));
};

FlowerPower.prototype.convertSunlightData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  var sunlight = 0.08640000000000001 * (192773.17000000001 * Math.pow(rawValue, -1.0606619));

  return sunlight;
};

FlowerPower.prototype.readSunlight = function(callback) {
  this.readDataCharacteristic(LIVE_SERVICE_UUID, SUNLIGHT_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var sunlight = this.convertSunlightData(data);

    callback(error, sunlight);
  }.bind(this));
};

FlowerPower.prototype.onSunlightChange = function(data) {
  var sunlight = this.convertSunlightData(data);

  this.emit('sunlightChange', sunlight);
};

FlowerPower.prototype.notifySunlight = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SUNLIGHT_UUID, true, this.onSunlightChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySunlight = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SUNLIGHT_UUID, false, this.onSunlightChange.bind(this), callback);
};

FlowerPower.prototype.convertSoilElectricalConductivityData = function(data) {
  var rawValue = data.readUInt16LE(0) * 1.0;

  // TODO: convert raw (0 - 1771) to 0 to 10 (mS/cm)
  var soilElectricalConductivity = rawValue;

  return soilElectricalConductivity;
};

FlowerPower.prototype.readSoilElectricalConductivity = function(callback) {
  this.readDataCharacteristic(LIVE_SERVICE_UUID, SOIL_EC_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var soilEC = this.convertSoilElectricalConductivityData(data);

    callback(null, soilEC);
  }.bind(this));
};

FlowerPower.prototype.onSoilElectricalConductivityChange = function(data) {
  var temperature = this.convertSoilElectricalConductivityData(data);

  this.emit('soilElectricalConductivityChange', temperature);
};

FlowerPower.prototype.notifySoilElectricalConductivity = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_EC_UUID, true, this.onSoilElectricalConductivityChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilElectricalConductivity = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_EC_UUID, false, this.onSoilElectricalConductivityChange.bind(this), callback);
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
  this.readDataCharacteristic(LIVE_SERVICE_UUID, SOIL_TEMPERATURE_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var temperature = this.convertTemperatureData(data);

    callback(null, temperature);
  }.bind(this));
};

FlowerPower.prototype.onSoilTemperatureChange = function(data) {
  var temperature = this.convertTemperatureData(data);

  this.emit('soilTemperatureChange', temperature);
};

FlowerPower.prototype.notifySoilTemperature = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_TEMPERATURE_UUID, true, this.onSoilTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilTemperature = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_TEMPERATURE_UUID, false, this.onSoilTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.readAirTemperature = function(callback) {
  this.readDataCharacteristic(LIVE_SERVICE_UUID, AIR_TEMPERATURE_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var temperature = this.convertTemperatureData(data);

    callback(null, temperature);
  }.bind(this));
};

FlowerPower.prototype.onAirTemperatureChange = function(data) {
  var temperature = this.convertTemperatureData(data);

  this.emit('airTemperatureChange', temperature);
};

FlowerPower.prototype.notifyAirTemperature = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, AIR_TEMPERATURE_UUID, true, this.onAirTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyAirTemperature = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, AIR_TEMPERATURE_UUID, false, this.onAirTemperatureChange.bind(this), callback);
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
  this.readDataCharacteristic(LIVE_SERVICE_UUID, SOIL_MOISTURE_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var soilMoisture = this.convertSoilMoistureData(data);

    callback(null, soilMoisture);
  }.bind(this));
};

FlowerPower.prototype.onSoilMoistureChange = function(data) {
  var soilMoisture = this.convertSoilMoistureData(data);

  this.emit('soilMoistureChange', soilMoisture);
};

FlowerPower.prototype.notifySoilMoisture = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_MOISTURE_UUID, true, this.onSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifySoilMoisture = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, SOIL_MOISTURE_UUID, false, this.onSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedSoilMoisture = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_SOIL_MOISTURE_UUID, callback);
};

FlowerPower.prototype.onCalibratedSoilMoistureChange = function(value) {
  this.emit('calibratedSoilMoistureChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedSoilMoisture = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_SOIL_MOISTURE_UUID, true, this.onCalibratedSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedSoilMoisture = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_SOIL_MOISTURE_UUID, false, this.onCalibratedSoilMoistureChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedAirTemperature = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_AIR_TEMPERATURE_UUID, callback);
};

FlowerPower.prototype.onCalibratedAirTemperatureChange = function(value) {
  this.emit('calibratedAirTemperatureChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedAirTemperatureChange = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_AIR_TEMPERATURE_UUID, true, this.onCalibratedAirTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedAirTemperatureChange = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_AIR_TEMPERATURE_UUID, false, this.onCalibratedAirTemperatureChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedSunlight = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_DLI_UUID, callback);
};

FlowerPower.prototype.onCalibratedSunlightChange = function(value) {
  this.emit('calibratedSunlightChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedSunlight = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_DLI_UUID, true, this.onCalibratedSunlightChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedSunlight = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_DLI_UUID, false, this.onCalibratedSunlightChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedEa = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EA_UUID, callback);
};

FlowerPower.prototype.onCalibratedEaChange = function(value) {
  this.emit('calibratedEaChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedEa = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EA_UUID, true, this.onCalibratedEaChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedEa = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EA_UUID, false, this.onCalibratedEaChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedEcb = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_ECB_UUID, callback);
};

FlowerPower.prototype.onCalibratedEcbChange = function(value) {
  this.emit('calibratedEcbChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedEcb = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_ECB_UUID, true, this.onCalibratedEcbChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedEcb = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_ECB_UUID, false, this.onCalibratedEcbChange.bind(this), callback);
};

FlowerPower.prototype.readCalibratedEcPorous = function(callback) {
  this.readFloatLECharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EC_POROUS_UUID, callback);
};

FlowerPower.prototype.onCalibratedEcPorousChange = function(value) {
  this.emit('calibratedEcPorousChange', value.readFloatLE(0));
};

FlowerPower.prototype.notifyCalibratedEcPorous = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EC_POROUS_UUID, true, this.onCalibratedEcPorousChange.bind(this), callback);
};

FlowerPower.prototype.unnotifyCalibratedEcPorous = function(callback) {
  this.notifyCharacteristic(LIVE_SERVICE_UUID, CALIBRATED_EC_POROUS_UUID, false, this.onCalibratedEcPorousChange.bind(this), callback);
};

FlowerPower.prototype.enableLiveModeWithPeriod = function(period, callback) {
  this.notifySunlight(function() {
    this.notifySoilElectricalConductivity(function() {
      this.notifySoilTemperature(function() {
        this.notifyAirTemperature(function() {
          this.notifySoilMoisture(function() {
            this.writeDataCharacteristic(LIVE_SERVICE_UUID, LIVE_MODE_PERIOD_UUID, new Buffer([period]), callback);
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
  this.writeDataCharacteristic(LIVE_SERVICE_UUID, LIVE_MODE_PERIOD_UUID, new Buffer([0x00]), function() {
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

FlowerPower.prototype.enableCalibratedLiveModeWithPeriod = function(period, callback) {
  this.notifyCalibratedSoilMoisture(function() {
    this.notifyCalibratedAirTemperatureChange(function() {
      this.notifyCalibratedSunlight(function() {
        this.notifyCalibratedEa(function() {
          this.notifyCalibratedEcb(function() {
            this.notifyCalibratedEcPorous(function() {
              this.writeDataCharacteristic(LIVE_SERVICE_UUID, LIVE_MODE_PERIOD_UUID, new Buffer([period]), callback);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

FlowerPower.prototype.enableCalibratedLiveMode = function(callback) {
  this.enableCalibratedLiveModeWithPeriod(1, callback);
};

FlowerPower.prototype.disableCalibratedLiveMode = function(callback) {
  this.writeDataCharacteristic(LIVE_SERVICE_UUID, LIVE_MODE_PERIOD_UUID, new Buffer([0x00]), function() {
    this.unnotifyCalibratedSoilMoisture(function() {
      this.unnotifyCalibratedAirTemperatureChange(function() {
        this.unnotifyCalibratedSunlight(function() {
          this.unnotifyCalibratedEa(function() {
            this.unnotifyCalibratedEcb(function() {
              this.unnotifyCalibratedEcPorous(function() {
                callback();
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

FlowerPower.prototype.getHistoryNbEntries = function(callback) {
	this.readDataCharacteristic(HISTORY_SERVICE_UUID, HISTORY_NB_ENTRIES_UUID, function (data) {
		var data = data.readUInt16LE(0);
		callback(data);
	}.bind(this));
};

FlowerPower.prototype.getHistoryLastEntryIdx = function(callback) {
	this.readDataCharacteristic(HISTORY_SERVICE_UUID,HISTORY_LASTENTRY_IDX_UUID, function (data) {
		var data = data.readUInt32LE(0);
		callback(data);
	}.bind(this));
};

FlowerPower.prototype.getHistoryCurrentSessionID = function(callback) {
	this.readDataCharacteristic(HISTORY_SERVICE_UUID, HISTORY_CURRENT_SESSION_ID_UUID, function (data) {
		var data = data.readUInt16LE(0);
		callback(data);
	}.bind(this));
};

FlowerPower.prototype.getHistoryCurrentSessionStartIdx = function(callback) {
	this.readDataCharacteristic(HISTORY_SERVICE_UUID, HISTORY_CURRENT_SESSION_START_IDX_UUID, function (data) {
		var data = data.readUInt32LE(0);
		callback(data);
	}.bind(this));
};

FlowerPower.prototype.getHistoryCurrentSessionPeriod = function(callback) {
	this.readDataCharacteristic(HISTORY_SERVICE_UUID, HISTORY_CURRENT_SESSION_PERIOD_UUID, function (data) {
		var data = data.readUInt16LE(0);
		callback(data);
	}.bind(this));
};

FlowerPower.prototype.writeTxStartIdx = function (startIdx, callback) {
	var startIdxBuff = new Buffer(4);
	startIdxBuff.writeUInt32LE(startIdx, 0);
	this.writeDataCharacteristic(HISTORY_SERVICE_UUID, HISTORY_TRANSFER_START_IDX_UUID, startIdxBuff, callback);
};

FlowerPower.prototype.getStartupTime = function (callback) {
	this.readDataCharacteristic(CLOCK_SERVICE_UUID, CLOCK_CURRENT_TIME_UUID, function (error, data) {
		if (error !== null){
			callback(error, null);
		} else {
			var startupTime = new Date();
			startupTime.setTime (startupTime.getTime() - data.readUInt32LE(0)*1000);
			callback(null, startupTime);
		}
	});
};

function UploadBuffer(buffer) {
	this.idx = buffer.readUInt16LE(0);
	this.data = new Buffer(buffer.slice(2));
	return this;
}

function Upload(fp, callback) {
	this.fp = fp;
	this.buffers = [];
	this.currentIdx = 0;
	this.RxStatusEnum = {
	STANDBY: 0,
	RECEIVING: 1,
	ACK: 2,
	NACK: 3,
	CANCEL: 4,
	ERROR: 5
};
    this.TxStatusEnum = {
	IDLE: 0,
	TRANSFERING: 1,
	WAITING_ACK: 2
};
	this.rxStatus = this.RxStatusEnum.STANDBY;
	this.TxStatus = this.TxStatusEnum.IDLE;
	this.finishCallback = callback;
	this.startUpload(function(err){
	if (err !== null) {
		this.finishCallback(err, null);
	}
});
	this.fileLength = null;
	this.bufferLength = null;
	this.nbTotalBuffers = null;
	return this;

}

Upload.prototype.onWaitingAck = function(callback) {
	var success = true;
    var packetSize;
    if (this.nbTotalBuffers > maxBufferSize) {
        packetSize = maxBufferSize;
    }
    else {
	    packetSize = this.nbTotalBuffers;
	}
	for (var idx=this.currentIdx; idx < packetSize; idx++) {
		if (idx>0){
			if (!this.buffers.hasOwnProperty(idx)){
				success = false;
			break;
			}
		}
	}
	if (success === true) {
        this.historyFile = Buffer.concat( this.buffers.slice(1), this.fileLength);
	    if (idx < this.nbTotalBuffers) {
			async.series([
				this.notifyTxStatus.bind(this),
				this.notifyTxBuffer.bind(this),
				this.writeRxStatus.bind(this, this.RxStatusEnum.ACK)]);
	    }
	    else {
            async.series([
                this.notifyTxStatus.bind(this),
				this.notifyTxBuffer.bind(this),
				this.writeRxStatus.bind(this, this.RxStatusEnum.ACK),
				this.notifyTxStatus.bind(this),
				this.notifyTxBuffer.bind(this),
				this.writeRxStatus.bind(this, this.RxStatusEnum.STANDBY)]);
		}
	}
	else {
		this.writeRxStatus(this.RxStatusEnum.NACK, callback);
	}

};

Upload.prototype.onTxStatusChange = function (data) {
	this.txStatus = data.readUInt8(0);
	if(this.txStatus === this.TxStatusEnum.WAITING_ACK) {
		this.onWaitingAck();
	}
	if(this.txStatus === this.TxStatusEnum.IDLE) {
			if (this.historyFile !== null) {
				this.finishCallback(null, this.historyFile.toString('base64'));
				return;
			}
			else {
				this.finishCallback(new Error("Transfer failed", null));
			}
	}
};

Upload.prototype.setFileLength = function (fileLength) {
	this.fileLength = fileLength;
	this.nbTotalBuffers = Math.ceil(this.fileLength / this.bufferLength)+1;
};

Upload.prototype.readFirstBuffer = function (buffer) {
	this.bufferLength = buffer.length;
	this.setFileLength(buffer.readUInt32LE(0));
};

Upload.prototype.onTxBufferReceived = function (data) {
	var buffer = new UploadBuffer(data);
	this.buffers[buffer.idx] = buffer.data;
	if (buffer.idx === 0) {
		this.readFirstBuffer(buffer.data);
    }
};

Upload.prototype.notifyTxStatus = function (callback) {
	this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_STATUS_UUID, true, this.onTxStatusChange.bind(this), callback);
};

Upload.prototype.notifyTxBuffer = function (callback) {
	this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_BUFFER_UUID, true, this.onTxBufferReceived.bind(this), callback);
};

Upload.prototype.unnotifyTxStatus = function (callback) {
	this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_STATUS_UUID, false, this.onTxStatusChange.bind(this), callback);
};

Upload.prototype.unnotifyTxBuffer = function (callback) {
	this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_BUFFER_UUID, false, this.onTxBufferReceived.bind(this), callback);
};

Upload.prototype.writeRxStatus = function (rxStatus, callback) {
	var rxStatusBuff = new Buffer(1);
	rxStatusBuff.writeUInt8(rxStatus, 0);
	this.fp.writeDataCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_RX_STATUS_UUID, rxStatusBuff, callback);
};

Upload.prototype.startUpload = function (callback) {
	async.series([
		this.notifyTxStatus.bind(this),
		this.notifyTxBuffer.bind(this),
		this.writeRxStatus.bind(this, this.RxStatusEnum.RECEIVING) ]);
};

FlowerPower.prototype.getHistory = function (startIdx, callback) {
	this.writeTxStartIdx(startIdx, function(err) {
	new Upload(this, callback);	
    }.bind(this));
};

FlowerPower.prototype.ledPulse = function(callback) {
  this.writeDataCharacteristic(LIVE_SERVICE_UUID, LED_UUID, new Buffer([0x01]), callback);
};

FlowerPower.prototype.ledOff = function(callback) {
  this.writeDataCharacteristic(LIVE_SERVICE_UUID, LED_UUID, new Buffer([0x00]), callback);
};

module.exports = FlowerPower;
