/**
 * Thsi class can be used to split text table to rows and columns.
 *
 * @export
 * @class TsvParser
 */
export class TsvParser {
  private lineCounter: number = 0;
  private lineBuffer?: string;
  /**
   * Creates an instance of TsvParser.
   * @param {string} [rowSeparator="\t"]
   * @param {string} [lineSeparator="\n"]
   * @memberof TsvParser
   */
  constructor(
    private rowSeparator: string = "\t",
    private lineSeparator: string = "\n"
  ) {}
  /**
   * Parse text to rows array. Each entity of rows array contain columns array. Last row go to buffer
   *
   * @param {string} str
   * @returns {string[][]}
   * @memberof TsvParser
   */
  public parseTextToLines(str: string): string[][] {
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
  public getBuffered(): string | undefined {
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
  public parseLine(line: string): string[] {
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
  public sanitizeString(str: string): string {
    return str.replace(/\s+/g, "_");
  }
}
