const Transform = require('stream').Transform;

/**
 * Show stream progress and time passed.
 */
class ProgressTransformStream extends Transform {
  /**
   *
   * @param {Number} size Stream size in bytes
   */
  constructor(size) {
    super();
    this.size = size;
    this.start = Date.now();
    this.processed = 0;
  }

  _transform(data, encoding, callback) {
    this.processed += data.length;
    const pers = Math.floor((this.processed * 100) / this.size);
    const deltaTime = Date.now() - this.start;
    const timePassed = Math.floor(deltaTime / 1000);
    const elapsedTime = Math.floor(this.calculatedElapsedTime(deltaTime) / 1000);
    process.stdout.write(`\rProgress: ${pers}%, time passed: ${timePassed}s, elapsedTime: ${elapsedTime}s`);
    callback(null, data);
  }

  calculatedElapsedTime(deltaTime) {
    const sizeLeft = this.size - this.processed;
    return (sizeLeft / this.processed) * deltaTime;
  }
}

module.exports = ProgressTransformStream;
