"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class FilterStream extends stream_1.Transform {
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