var fs = require('fs');
var async = require('async');

const LEN_FRAME = 15;

function Update(fp, binaryFile, callback) {
  this.fp = fp;
  this.file = binaryFile;
  this.positionFile = 0;
  this.fd;
  this.size = 0;
  this.frame = [];
  return (this);
};

Update.prototype.getHeader = function(callback) {
  var buff = new Buffer(12);

  fs.read(this.fd, buff, 0, buff.length, 0, function(err, bytesRead, buffer) {
    this.size = buffer.readUInt16LE(6);
    console.log('Size:', this.size);
    callback(err);
  }.bind(this));
};

Update.prototype.readAFrame = function(callback) {
  var buff = new Buffer(LEN_FRAME);

  fs.read(this.fd, buff, 0, buff.length, this.positionFile, function(err, bytesRead, buffer) {
    console.log('frame (' + this.positionFile + '/' + this.size + ')', buffer);
    this.positionFile += bytesRead;
    callback(err);
  }.bind(this));
};

Update.prototype.readGroupFrame = function(callback) {
  var nbFrame = 0;

  async.whilst(
    function() {
      return nbFrame < 128;
    }.bind(this),
    function(callback) {
      nbFrame++;
      this.readAFrame(callback);
    }.bind(this),
    function(err, n) {
      callback(err)
    }
  );
};

Update.prototype.writeFrimware = function(callback) {
  var pos = 0;

  async.whilst(
    function() {return pos < this.size}.bind(this),
    function(callback) {
      pos += 128 * LEN_FRAME;
      setTimeout(function() {
        this.readGroupFrame(callback);
      }.bind(this), 10);
    }.bind(this),
    function(err, n) {
      callback(err)
    }
  );

};

Update.prototype.startUpdate = function(callback) {
  console.log('startUpdate()');
  var finishCallback = function(err) {
    if (this.fd >= 3) fs.closeSync(this.fd);
    callback(err);
  }.bind(this);

  fs.open(this.file, 'r', function(err, fd) {
    if (err) return callback(err);
    this.fd = fd;
    console.log('fd:', fd);
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
