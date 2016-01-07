var async = require('async');
var UploadBuffer = require('./UploadBuffer');

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
	for (var idx=this.currentIdx; ((idx < this.currentIdx+128) && (idx < this.nbTotalBuffers)); idx++) {
		if (idx>0){
			if (!this.buffers.hasOwnProperty(idx)){
				success = false;
				break;
			}
		}
	}
	if (success === true) {
		this.currentIdx += 128;
		if (this.currentIdx >= this.nbTotalBuffers){
			this.historyFile = Buffer.concat(this.buffers.slice(1), this.fileLength);
			async.series([
					this.writeRxStatus.bind(this, this.RxStatusEnum.ACK),
					this.unnotifyTxStatus.bind(this),
					this.unnotifyTxBuffer.bind(this),
					this.writeRxStatus.bind(this, this.RxStatusEnum.STANDBY)]);
		}
		else{
			async.series([
					this.writeRxStatus.bind(this, this.RxStatusEnum.ACK)
					]);
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
		if (this.historyFile !== null && typeof this.historyFile !== 'undefined') {
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

module.exports = Upload;
