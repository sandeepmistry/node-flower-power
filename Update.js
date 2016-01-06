var fs = require('fs');
var async = require('async');

const LEN_FRAME = 16;

var DOWNLOAD_SERVICE                        = 'f000ffc004514000b000000000000000';
var OAD_IMAGE_NOTIFIY                       = 'f000ffc104514000b000000000000000';
var OAD_IMAGE_BLOCK                         = 'f000ffc204514000b000000000000000';

function Update(fp, binaryFile, callback) {
  this.fp = fp;
  this.file = binaryFile;
  this.fd;
  this.size = 0;

  return this;
};

Update.prototype.getHeader = function(callback) {
  var buff = new Buffer(8);

  fs.read(this.fd, buff, 0, buff.length, 4, function(err, bytesRead, buffHeader) {
    this.size = buffHeader.readUInt16LE(2);
    this.fp.writeDataCharacteristic(DOWNLOAD_SERVICE, OAD_IMAGE_NOTIFIY, buffHeader, function(err) {
      callback(err);
    }.bind(this));
  }.bind(this));
};

Update.prototype.getIndex = function(callback) {
  this.fp.readDataCharacteristic(DOWNLOAD_SERVICE, OAD_IMAGE_BLOCK, function(err, data) {
    if (err || !data) callback(err || new Error('No data'));
    else callback(null, data.readUInt16LE(0));
  });
};

Update.prototype.readAFrame = function(index, callback) {
  var buff = new Buffer(LEN_FRAME);

  fs.read(this.fd, buff, 0, buff.length, index * LEN_FRAME, function(err, bytesRead, buffer) {
    callback(err, buffer);
  }.bind(this));
};

Update.prototype.writeAFrame = function(index, buffer, callback) {
  var frame = new Buffer(2 + LEN_FRAME); // index + buffer;

  frame.writeUInt16LE(index);
  buffer.copy(frame, 2);
  console.log('(' + frame.readUInt16LE(0) + '/' + this.size + ' ' + Math.floor((index / this.size) * 100) + '%)', frame);
  this.fp.writeDataCharacteristic(DOWNLOAD_SERVICE, OAD_IMAGE_BLOCK, frame, function(err) {
    callback(err);
  });
};

Update.prototype.readAndWriteGroupFrame = function(index, callback) {
  var nbFrame = 0;

  async.whilst(
    function() {return nbFrame < 128}.bind(this),
    function(callback) {
      this.readAFrame(index + nbFrame, function(err, frame) {
        if (err) callback(err);
        else {
          this.writeAFrame(index + nbFrame, frame, function(err) {
            nbFrame++;
            callback(err);
          });
        }
      }.bind(this));
    }.bind(this),
    function(err, n) {
      callback(err);
    }
  );
};

Update.prototype.updateGroupFrame = function(callback) {
  this.getIndex(function(err, index) {
    this.readAndWriteGroupFrame(index, function(err) {
      callback(err);
    }.bind(this));
  }.bind(this));
};

Update.prototype.writeFrimware = function(callback) {
  async.whilst(
    function() {return true},
    function(callback) {
      this.updateGroupFrame(function(err) {
        callback(err);
      });
    }.bind(this),
    function(err, n) {callback(err)}
  );
};

Update.prototype.startUpdate = function(callback) {
  var finishCallback = function(err) {
    if (this.fd >= 3) fs.closeSync(this.fd);
    callback(err);
  }.bind(this);

  fs.open(this.file, 'r', function(err, fd) {
    if (err) return callback(err);
    this.fd = fd;
    async.series([
      function(callback) {
        this.getHeader(callback);
      }.bind(this),
      function(callback) {
        this.writeFrimware(callback)
      }.bind(this)
    ], function(err) {
      return callback(err);
    }.bind(this));
  }.bind(this));
};

module.exports = Update;
