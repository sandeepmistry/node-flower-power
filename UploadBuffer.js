function UploadBuffer(buffer) {
	this.idx = buffer.readUInt16LE(0);
	this.data = new Buffer(buffer.slice(2));
	return this;
}

module.exports = UploadBuffer;
