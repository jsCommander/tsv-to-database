const Transform = require('stream').Transform;

const defaultOptions = {
  isHeadless: false,
  stringEncoding: 'utf8',
  headers: null,
  lineSeparator: '\n',
  rowSeparator: '\t',
  filter: null,
};
/**
 * Transform stream from .tsv files to JSON object
 */
class TsvToJsonTransformStream extends Transform {
  constructor(options) {
    super({ readableObjectMode: true });
    this.options = Object.assign(defaultOptions, options);
    this.lineBuffer = '';
    this.hasHeaders = false;

    // Check for correct headers in headless mode
    if (this.options.isHeadless) {
      this.hasHeaders = Array.isArray(this.options.headers);
      if (!this.hasHeaders) {
        throw new Error('For headless mode you must provide headers array');
      }
    }
    // Check that filter is function
    if (this.options.filter) {
      if (this.options.filter instanceof Function) {
        this.hasFilter = true;
      } else {
        throw new Error('Filter must be function');
      }
    } else {
      this.hasFilter = false;
    }
  }

  _transform(chunk, encoding, callback) {
    const lines = this.chunkToStringArray(chunk);

    // if we dont have headers we create it from first line
    if (!this.hasHeaders) {
      const headers = lines.shift().split(this.options.rowSeparator);
      this.options.headers = headers.map(item => this.escapeColumnName(item));
      this.hasHeaders = true;
    }

    lines[0] = this.lineBuffer + lines[0];
    this.lineBuffer = lines.pop();

    lines.forEach(line => {
      const obj = this.lineToJson(line);
      let passFilter = true;

      if (this.hasFilter) {
        passFilter = this.options.filter(obj);
      }
      if (passFilter) {
        this.push(obj);
      }
    });
    callback();
  }

  _flush(callback) {
    if (this.lineBuffer) {
      const obj = this.lineToJson(this.lineBuffer);
      let passFilter = true;

      if (this.hasFilter) {
        passFilter = this.options.filter(obj);
      }
      if (passFilter) {
        this.push(obj);
      }
    }
    callback();
  }
  /**
   *
   * @param {Buffer} chunk
   * @returns {[String]}
   */
  chunkToStringArray(chunk) {
    const data = chunk.toString(this.options.stringEncoding);
    const lines = data.split(this.options.lineSeparator);
    return lines;
  }
  /**
   *
   *
   * @param {String} line
   * @returns {{}}
   */
  lineToJson(line) {
    const cols = line.split(this.options.rowSeparator);
    const obj = {};

    cols.forEach((item, index) => {
      const name = this.options.headers[index];
      obj[name || 'Unknown'] = item;
    });
    return obj;
  }

  escapeColumnName(str) {
    str = str.replace(/\s+/g, '');
    return str.toLowerCase();
  }
}

module.exports = TsvToJsonTransformStream;
