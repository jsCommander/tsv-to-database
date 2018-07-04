const Transform = require('stream').Transform;

/**
 * Filter objects from stream using provided filter function
 */
class FilterTransformStream extends Transform {
  constructor(filter) {
    super({ objectMode: true });

    // Check that filter is function
    if (!filter || !(filter instanceof Function)) {
      throw new Error('Filter must be function');
    } else {
      this.filter = filter;
    }
  }

  _transform(obj, encoding, callback) {
    if (this.filter(obj)) {
      this.push(obj);
    }
    callback();
  }
}

module.exports = FilterTransformStream;
