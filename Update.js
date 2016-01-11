var bufferEqual = require('buffer-equal');
var fs = require('fs');
var async = require('async');

const LEN_FRAME = 16;

var DOWNLOAD_SERVICE                        = 'f000ffc004514000b000000000000000';
var OAD_IMAGE_NOTIFIY                       = 'f000ffc104514000b000000000000000';
var OAD_IMAGE_BLOCK                         = 'f000ffc204514000b000000000000000';

function Update(fp, binaryFile) {
  this.fp = fp;
  this.file = binaryFile;
  this.fd;
  this.size = 0;

  return this;
};

Update.prototype.extractHeaderFile = function(callback) {
  var buff = new Buffer(8);

  fs.read(this.fd, buff, 0, buff.length, 4, function(err, bytesRead, buffHeader) {
    if (err) return callback(err, null);
    else {
      this.size = buffHeader.readUInt16LE(2);
      callback(err, buffHeader);
    }
  }.bind(this));
};

Update.prototype.setImageNotify = function(buffHeader, callback) {
  this.fp.writeDataCharacteristic(DOWNLOAD_SERVICE, OAD_IMAGE_NOTIFIY, buffHeader, function(err) {
    callback(err);
  });
};

Update.prototype.getImageNotify = function(callback) {
  this.fp.readDataCharacteristic(DOWNLOAD_SERVICE, OAD_IMAGE_NOTIFIY, function(err, data) {
    if (err || !data) callback(err || new Error('No data'));
    else callback(null, data);
  });
};

Update.prototype.initUpdate = function(callback) {
  async.parallel({
    header: function(callback) {
      this.extractHeaderFile(callback);
    }.bind(this),
    notify: function(callback) {
      this.getImageNotify(callback);
    }.bind(this),
    index: function(callback) {
      this.getIndex(callback);
    }.bind(this)
  }, function(err, res) {
    if (!bufferEqual(res.header, res.notify)) {
      this.setImageNotify(res.header, callback);
    }
    else callback("No update firmware required");
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
  console.log('(' + (index + 1) + '/' + this.size + ' ' + Math.floor(((index + 1) / this.size) * 100) + '%)', frame);
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
  this.fp._peripheral.on('disconnect', function(err) {
    return callback(err);
  });

  fs.open(this.file, 'r', function(err, fd) {
    if (err) return callback(err);
    this.fd = fd;

    async.series([
      function(callback) {
        this.initUpdate(callback);
      }.bind(this),
      function(callback) {
        this.writeFrimware(callback)
      }.bind(this)
    ], function(err) {
      if (this.fd >= 3) fs.closeSync(this.fd);
      callback(err);
    }.bind(this));

  }.bind(this));
};

module.exports = Update;
