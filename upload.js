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
      this.historyFile = Buffer.concat( this.buffers.slice(1), this.fileLength);
    }
    else{
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
        this.finishCallback(null, this.historyFile.toString('hex'));
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

Upload.prototype.notifyTxStatus = function(callback) {
  this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_STATUS_UUID, true, this.onTxStatusChange.bind(this), callback);
};

Upload.prototype.notifyTxBuffer = function(callback) {
  this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_BUFFER_UUID, true, this.onTxBufferReceived.bind(this), callback);
};

Upload.prototype.unnotifyTxStatus = function(callback) {
  this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_STATUS_UUID, false, this.onTxStatusChange.bind(this), callback);
};

Upload.prototype.unnotifyTxBuffer = function(callback) {
  this.fp.notifyCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_TX_BUFFER_UUID, false, this.onTxBufferReceived.bind(this), callback);
};

Upload.prototype.writeRxStatus = function(rxStatus, callback) {
  var rxStatusBuff = new Buffer(1);
  rxStatusBuff.writeUInt8(rxStatus, 0);
  this.fp.writeDataCharacteristic(UPLOAD_SERVICE_UUID, UPLOAD_RX_STATUS_UUID, rxStatusBuff, callback);
};

Upload.prototype.startUpload = function(callback) {
  async.series([
    this.notifyTxStatus.bind(this),
    this.notifyTxBuffer.bind(this),
    this.writeRxStatus.bind(this, this.RxStatusEnum.RECEIVING)
  ]);
};

module.exports = Upload;
