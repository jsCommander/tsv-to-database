"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Can parse tsv string
 */
class TsvParser {
    constructor(rowSeparator = "\t", lineSeparator = "\n") {
        this.rowSeparator = rowSeparator;
        this.lineSeparator = lineSeparator;
        this.lineCounter = 0;
    }
    parseTextToLines(str) {
        const lines = str.split(this.lineSeparator);
        if (this.lineBuffer) {
            lines[0] = this.lineBuffer + lines[0];
        }
        // add last line to buffer
        const lastLine = lines.pop();
        this.lineBuffer = lastLine;
        this.lineCounter += lines.length;
        return lines.map(line => this.parseLine(line));
    }
    get counter() {
        return this.lineCounter;
    }
    getBuffered() {
        return this.lineBuffer;
    }
    parseLine(line) {
        const cols = line.split(this.rowSeparator);
        return cols;
    }
    sanitizeString(str) {
        return str.replace(/\s+/g, "_");
    }
}
exports.TsvParser = TsvParser;
//# sourceMappingURL=TsvParser.js.map