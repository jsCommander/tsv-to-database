"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * This class can filter stream. Only objects that pass filter function will be piped to next stream
 *
 * @export
 * @class FilterStream
 * @extends {Transform}
 */
class FilterStream extends stream_1.Transform {
    /**
     * Creates an instance of FilterStream.
     * @param filter function that will be used to filter stream
     * @memberof FilterStream
     */
    constructor(filter) {
        super({ objectMode: true });
        this.filter = filter;
    }
    _transform(chunk, encoding, callback) {
        if (!Array.isArray(chunk)) {
            callback(new Error(`Filter stream can't procces ${typeof chunk} input. It works works only with arrays of objects`));
        }
        const filtered = chunk.filter(x => this.filter(x));
        this.push(filtered);
        callback();
    }
}
exports.FilterStream = FilterStream;
//# sourceMappingURL=FilterStream.js.map