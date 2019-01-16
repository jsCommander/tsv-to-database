"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Thsi class can be used to split text table to rows and columns.
 *
 * @export
 * @class TsvParser
 */
class TsvParser {
    /**
     * Creates an instance of TsvParser.
     * @param {string} [rowSeparator="\t"]
     * @param {string} [lineSeparator="\n"]
     * @memberof TsvParser
     */
    constructor(rowSeparator = "\t", lineSeparator = "\n") {
        this.rowSeparator = rowSeparator;
        this.lineSeparator = lineSeparator;
        this.lineCounter = 0;
    }
    /**
     * Parse text to rows array. Each entity of rows array contain columns array. Last row go to buffer
     *
     * @param {string} str
     * @returns {string[][]}
     * @memberof TsvParser
     */
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
    /**
     * return buffer content
     *
     * @returns {(string | undefined)}
     * @memberof TsvParser
     */
    getBuffered() {
        const buff = this.lineBuffer;
        this.lineBuffer = "";
        return buff;
    }
    /**
     * parse line to columns
     *
     * @param {string} line
     * @returns {string[]}
     * @memberof TsvParser
     */
    parseLine(line) {
        const cols = line.split(this.rowSeparator);
        return cols;
    }
    /**
     * remove spaces from string
     *
     * @param {string} str
     * @returns {string}
     * @memberof TsvParser
     */
    sanitizeString(str) {
        return str.replace(/\s+/g, "_");
    }
}
exports.TsvParser = TsvParser;
//# sourceMappingURL=TsvParser.js.map